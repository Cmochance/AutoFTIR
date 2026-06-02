# -*- coding: utf-8 -*-
"""
分析路由
"""
import base64
from typing import Any, Dict, Optional, Union

from fastapi import APIRouter, File, UploadFile, Query, HTTPException
from pydantic import BaseModel, Field

from backend.modules import DataProcessor, ChartRenderer, AIAnalyzer

router = APIRouter()

# 模块实例
data_processor = DataProcessor()
chart_renderer = ChartRenderer()
ai_analyzer = AIAnalyzer()


class ProcessDataResponse(BaseModel):
    """数据处理响应"""

    success: bool
    data: Dict[str, Any]


class RenderChartResponse(BaseModel):
    """图表渲染响应"""

    success: bool
    image_base64: str = Field(description="标准 base64 图像数据")
    image_mime: str = Field(description="图像 MIME 类型")
    metadata: Dict[str, Any]


class FullAnalysisResponse(BaseModel):
    """完整分析响应"""

    success: bool
    processed_data: Dict[str, Any]
    chart_metadata: Dict[str, Any]
    chart_image_base64: str
    chart_image_mime: str
    report: Union[Dict[str, Any], str]
    ai_status: str = Field(description="ok|degraded")
    ai_error: Optional[str] = None


def _to_base64(raw: bytes) -> str:
    """字节转标准 base64 字符串"""
    return base64.b64encode(raw).decode("ascii")


def _mime_for_format(output_format: str) -> str:
    fmt = (output_format or "").lower()
    if fmt == "svg":
        return "image/svg+xml"
    if fmt == "pdf":
        return "application/pdf"
    return "image/png"


def _to_dict(value: Any) -> Dict[str, Any]:
    """将对象转换为字典"""
    if isinstance(value, dict):
        return value
    if hasattr(value, "__dict__"):
        return dict(value.__dict__)
    return {}


@router.post("/process", response_model=ProcessDataResponse)
async def process_data(
    file: UploadFile = File(..., description="数据文件"),
):
    """
    处理上传的数据文件
    
    - 自动识别数据类型
    - 应用处理模板
    - 返回处理后的数据
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="上传文件为空")

    result = await data_processor.process(file_bytes, file.filename or "data.csv")

    return ProcessDataResponse(success=True, data=result.to_dict())


@router.post("/render", response_model=RenderChartResponse)
async def render_chart(
    file: UploadFile = File(..., description="数据文件"),
    style: str = Query("scientific", description="图表样式"),
    output_format: str = Query("png", alias="format", description="输出格式"),
):
    """
    绑制图表
    
    - 处理数据
    - 生成图表
    - 返回图表图像
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="上传文件为空")

    # 1. 处理数据
    processed_data = await data_processor.process(file_bytes, file.filename or "data.csv")

    # 2. 绑制图表
    chart_output = await chart_renderer.render(processed_data, style, output_format)

    return RenderChartResponse(
        success=True,
        image_base64=_to_base64(chart_output.image_bytes),
        image_mime=_mime_for_format(chart_output.image_format),
        metadata=_to_dict(chart_output.metadata),
    )


@router.post("/full", response_model=FullAnalysisResponse)
async def full_analysis(
    file: UploadFile = File(..., description="数据文件"),
    style: str = Query("scientific", description="图表样式"),
    use_grounding: bool = Query(True, description="是否使用 Google Search"),
    use_knowledge: bool = Query(True, description="是否使用知识库"),
):
    """
    完整分析流程
    
    1. 数据处理
    2. 图表绑制
    3. AI 深度分析
    """
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="上传文件为空")

    # 1. 处理数据
    processed_data = await data_processor.process(file_bytes, file.filename or "data.csv")

    # 2. 绑制图表
    chart_output = await chart_renderer.render(processed_data, style, "png")

    # 3. AI 分析
    ai_status = "ok"
    ai_error = None
    report_payload: Union[Dict[str, Any], str] = {
        "summary": "",
        "key_findings": [],
        "peak_assignments": [],
        "suggestions": [],
        "references": [],
        "confidence": 0.0,
    }

    try:
        report = await ai_analyzer.analyze(chart_output, use_grounding, use_knowledge)
        report_payload = report.__dict__ if hasattr(report, "__dict__") else str(report)
    except Exception as exc:
        ai_status = "degraded"
        ai_error = str(exc)

    return FullAnalysisResponse(
        success=True,
        processed_data=processed_data.to_dict(),
        chart_metadata=_to_dict(chart_output.metadata),
        chart_image_base64=_to_base64(chart_output.image_bytes),
        chart_image_mime="image/png",
        report=report_payload,
        ai_status=ai_status,
        ai_error=ai_error,
    )
