import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'

const HEADERS = [
  { key: 'id', title: '镜号', width: 6 },
  { key: 'camera_setup', title: '机位镜头', width: 22 },
  { key: 'shot_size', title: '景别', width: 16 },
  { key: 'camera_movement', title: '运镜', width: 18 },
  { key: 'visual_art', title: '美术视觉', width: 28 },
  { key: 'content_description', title: '内容描述/动作', width: 28 },
  { key: 'dialogue', title: '台词', width: 20 },
  { key: 'voiceover', title: '旁白/独白', width: 22 },
  { key: 'sound_effects', title: '音效/音乐', width: 26 },
  { key: 'transition', title: '转场', width: 12 },
  { key: 'duration', title: '时长(s)', width: 10 },
  { key: 'props_costumes', title: '道具/服装', width: 22 },
  { key: 'remarks', title: '备注', width: 24 },
]

const HEADER_BG = 'FF1A1D20'
const HEADER_FONT_COLOR = 'FFFFFFFF'
const ROW_BG_ODD = 'FFFFFFFF'
const ROW_BG_EVEN = 'FFF8F9FA'
const BORDER_COLOR = 'FFD1D5DB'
const ACCENT_COLOR = 'FF6366F1'
const FONT_FAMILY = 'Microsoft YaHei'

export async function POST(request: NextRequest) {
  try {
    const { shots } = await request.json()
    if (!shots || !Array.isArray(shots) || shots.length === 0) {
      return NextResponse.json({ error: '无分镜数据' }, { status: 400 })
    }

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'AI 分镜脚本生成系统'
    workbook.created = new Date()

    const sheet = workbook.addWorksheet('分镜脚本', {
      properties: { tabColor: { argb: ACCENT_COLOR } },
      views: [{ state: 'frozen', ySplit: 1 }],
    })

    // ── 列宽设置 ──
    HEADERS.forEach((h, i) => {
      sheet.getColumn(i + 1).width = h.width
    })

    // ── 表头行 ──
    const headerRow = sheet.getRow(1)
    headerRow.height = 36
    HEADERS.forEach((h, i) => {
      const cell = headerRow.getCell(i + 1)
      cell.value = h.title
      cell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: HEADER_FONT_COLOR } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } }
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
      cell.border = {
        top: { style: 'thin', color: { argb: BORDER_COLOR } },
        bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      }
    })

    // ── 数据行 ──
    shots.forEach((shot, rowIdx) => {
      const row = sheet.getRow(rowIdx + 2)
      row.height = Math.max(60, 18 + (Object.values(shot).join('').length / 30) * 3)

      HEADERS.forEach((h, colIdx) => {
        const cell = row.getCell(colIdx + 1)
        let value = shot[h.key] ?? ''
        if (h.key === 'id') value = shot.id || rowIdx + 1
        if (h.key === 'duration') value = Number(shot.duration) || 5
        cell.value = value

        // 交替行色
        const isOdd = rowIdx % 2 === 0
        cell.fill = {
          type: 'pattern', pattern: 'solid',
          fgColor: { argb: isOdd ? ROW_BG_ODD : ROW_BG_EVEN },
        }
        cell.font = {
          name: FONT_FAMILY, size: 10,
          bold: h.key === 'id',
          color: { argb: h.key === 'id' ? ACCENT_COLOR : 'FF374151' },
        }
        cell.alignment = {
          vertical: 'top',
          horizontal: h.key === 'id' || h.key === 'duration' ? 'center' : 'left',
          wrapText: true,
        }
        cell.border = {
          top: { style: 'thin', color: { argb: BORDER_COLOR } },
          bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
          left: { style: 'thin', color: { argb: BORDER_COLOR } },
          right: { style: 'thin', color: { argb: BORDER_COLOR } },
        }
      })
    })

    // ── 汇总行 ──
    const totalRow = sheet.getRow(shots.length + 2)
    totalRow.height = 32
    const totalCell = totalRow.getCell(1)
    totalCell.value = '总计'
    totalCell.font = { name: FONT_FAMILY, size: 11, bold: true, color: { argb: 'FF374151' } }
    totalCell.alignment = { vertical: 'middle', horizontal: 'center' }
    totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }

    // 空单元格填充
    for (let i = 2; i <= 10; i++) {
      const c = totalRow.getCell(i)
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }
    }

    // SUM 公式
    const durationCol = HEADERS.findIndex(h => h.key === 'duration') + 1
    const durationLetter = String.fromCharCode(64 + durationCol)
    const sumCell = totalRow.getCell(durationCol)
    sumCell.value = { formula: `SUM(${durationLetter}2:${durationLetter}${shots.length + 1})` }
    sumCell.font = { name: FONT_FAMILY, size: 12, bold: true, color: { argb: ACCENT_COLOR } }
    sumCell.alignment = { vertical: 'middle', horizontal: 'center' }
    sumCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }

    const remarksCol = HEADERS.findIndex(h => h.key === 'remarks') + 1
    const remarkCell = totalRow.getCell(remarksCol)
    remarkCell.value = `共 ${shots.length} 镜`
    remarkCell.font = { name: FONT_FAMILY, size: 10, italic: true, color: { argb: 'FF9CA3AF' } }
    remarkCell.alignment = { vertical: 'middle', horizontal: 'right' }
    remarkCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }

    // 边框补全
    for (let i = 1; i <= HEADERS.length; i++) {
      const c = totalRow.getCell(i)
      c.border = {
        top: { style: 'medium', color: { argb: BORDER_COLOR } },
        bottom: { style: 'medium', color: { argb: BORDER_COLOR } },
        left: { style: 'thin', color: { argb: BORDER_COLOR } },
        right: { style: 'thin', color: { argb: BORDER_COLOR } },
      }
    }

    // ── 输出 Buffer ──
    const buffer = await workbook.xlsx.writeBuffer()

    const filename = `storyboard_${new Date().toISOString().slice(0, 10)}.xlsx`
    const encodedFilename = encodeURIComponent('分镜脚本') + '_' + new Date().toISOString().slice(0, 10) + '.xlsx'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      },
    })
  } catch (e) {
    console.error('Excel generation error:', e)
    return NextResponse.json({ error: 'Excel 生成失败' }, { status: 500 })
  }
}
