// JSON 容错解析
function extractJsonArray(text) {
  try {
    var str = text.trim()
    var m = str.match(/\[\s*\{[\s\S]*\}\s*\]/)
    if (m) str = m[0]
    var parsed = JSON.parse(str)
    if (Array.isArray(parsed)) return parsed
  } catch (e1) {
    try {
      var cleaned = text.replace(/```json|```/g, '').trim()
      var m2 = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (m2) cleaned = m2[0]
      cleaned = cleaned.replace(/,\s*\]/g, ']').replace(/,\s*\}/g, '}')
      var parsed = JSON.parse(cleaned)
      if (Array.isArray(parsed)) return parsed
    } catch (e2) {
      try {
        var raw = text.replace(/```json|```/g, '').trim()
        var matches = raw.match(/\{[\s\S]*?\}/g)
        if (matches) return matches.map(function (m) { try { return JSON.parse(m) } catch (e) { return null } }).filter(Boolean)
      } catch (e3) {}
    }
  }
  return null
}

// 景别 → 颜色分类
function getShotSizeClass(shotSize) {
  if (!shotSize) return 'default'
  var s = shotSize.toUpperCase()
  if (s.indexOf('ECU') > -1 || s.indexOf('CU') > -1 || s.indexOf('大特写') > -1 || s.indexOf('特写') > -1) return 'closeup'
  if (s.indexOf('MCU') > -1 || s.indexOf('MS') > -1 || s.indexOf('中') > -1) return 'mid'
  if (s.indexOf('FS') > -1 || s.indexOf('LS') > -1 || s.indexOf('ELS') > -1 || s.indexOf('全景') > -1 || s.indexOf('远景') > -1) return 'wide'
  return 'default'
}

Page({
  _requestTask: null,
  _cleanedUp: false,

  onLoad: function () {
    this._cleanedUp = false
  },

  onUnload: function () {
    this._cleanedUp = true
    this._abortRequest()
  },

  onHide: function () {
    // 页面切后台时中止请求，防止监听器堆积
    this._abortRequest()
  },

  _abortRequest: function () {
    if (this._requestTask) {
      try { this._requestTask.abort() } catch (e) {}
      this._requestTask = null
    }
    this.setData({ generating: false })
  },

  data: {
    theme: '',
    style: '',
    videoTypes: ['商业广告', '剧情短片', '知识科普', '音乐MV', 'Vlog日常', '宣传片', '微电影', '纪录片'],
    videoTypeIdx: 0,
    deviceLabels: ['电影机 35mm', '电影机 85mm', '单反 50mm', '手机竖屏', '手机横屏', '微单 24mm'],
    deviceValues: ['ARRI Alexa 35mm广角', 'ARRI Alexa 85mm人像', '单反 50mm f/1.4', '手机竖屏 9:16', '手机横屏 16:9', '微单 24mm广角'],
    deviceIdx: 0,
    counts: [4, 6, 8, 10, 12, 16],
    countIdx: 2,
    generating: false,
    status: '',
    statusType: '',
    streamText: '',
    shots: [],
    totalDuration: 0,
    exporting: false
  },

  onTheme: function (e) { this.setData({ theme: e.detail.value }) },
  onStyle: function (e) { this.setData({ style: e.detail.value }) },
  onVideoType: function (e) { this.setData({ videoTypeIdx: parseInt(e.detail.value) }) },
  onDevice: function (e) { this.setData({ deviceIdx: parseInt(e.detail.value) }) },
  onCount: function (e) { this.setData({ countIdx: parseInt(e.detail.value) }) },

  handleGenerate: function () {
    var that = this
    if (!this.data.theme.trim() || this.data.generating) return

    // 清理上一个请求，防止监听器叠加
    this._abortRequest()

    this.setData({
      generating: true, status: '正在连接 AI...', statusType: '',
      streamText: '', shots: [], totalDuration: 0, exporting: false
    })

    // 防止页面已销毁
    if (this._cleanedUp) return

    var body = {
      theme: this.data.theme.trim(),
      style: this.data.style.trim(),
      videoType: this.data.videoTypes[this.data.videoTypeIdx],
      equipment: this.data.deviceValues[this.data.deviceIdx],
      shotCount: this.data.counts[this.data.countIdx]
    }

    var finalShots = []
    var fullText = ''
    var startTime = Date.now()

    var task = wx.request({
      url: 'https://api.deepseek.com/v1/chat/completions',
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + require('../../utils/config').deepseekKey
      },
      data: {
        model: 'deepseek-chat',
        stream: true,
        temperature: 0.7,
        max_tokens: 4000,
        messages: [{
          role: 'system',
          content: '你是世界顶级电影导演与分镜师。生成极细致分镜脚本。严格输出JSON数组，每项13字段：id,camera_setup(写明机号焦段机位高度角度),shot_size(景别+英文),camera_movement(运镜),visual_art(含色调光影构图氛围，前后连贯),content_description(具体动作表情视线走位),dialogue(台词，无则写"无"，首尾呼应),voiceover(旁白+音频处理方式，无则写"无"),sound_effects(环境音+Foley+音乐情绪),transition(具体转场方式),duration(秒,2-12),props_costumes(具体道具服装),remarks(【摄影】【灯光】【剪辑】三工种指令)。纯JSON数组，无```标记。'
        }, { role: 'user', content: '主题：' + body.theme + '\n类型：' + body.videoType + '\n风格：' + (body.style || '不限') + '\n设备：' + body.equipment + '\n约' + body.shotCount + '镜' }]
      },
      enableChunked: true,
      timeout: 60000,
      success: function () {},
      fail: function (err) {
        that._requestTask = null
        if (!that._cleanedUp && that.data.generating) {
          that.setData({ generating: false, status: '网络错误: ' + (err.errMsg || '请重试'), statusType: 'error' })
        }
      }
    })
    this._requestTask = task

    // 流式监听
    task.onChunkReceived(function (res) {
      if (that._cleanedUp || !that.data.generating) return
      try {
        var chunk = res.data
        // DeepSeek SSE 格式: data: {...}
        var text = typeof chunk === 'string' ? chunk : new TextDecoder().decode(new Uint8Array(chunk))
        var lines = text.split('\n').filter(function (l) { return l.indexOf('data: ') === 0 })
        for (var i = 0; i < lines.length; i++) {
          var d = lines[i].slice(6)
          if (d === '[DONE]') continue
          try {
            var json = JSON.parse(d)
            var content = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content
            if (content) {
              fullText += content
              if (fullText.length < 1000) {
                that.setData({ streamText: fullText })
              }
              // 尝试解析
              var parsed = extractJsonArray(fullText)
              if (parsed && parsed.length > 0 && parsed[0].id) {
                finalShots = parsed.map(function (s, j) { s.expanded = j === 0; s.copied = false; s.shotSizeClass = getShotSizeClass(s.shot_size); return s })
                var dur = finalShots.reduce(function (sum, s) { return sum + (s.duration || 0) }, 0)
                var elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
                that.setData({
                  shots: finalShots,
                  totalDuration: dur,
                  status: '生成中 · ' + finalShots.length + ' 镜 · 已耗时' + elapsed + 's'
                })
              }
            }
          } catch (e) {}
        }
      } catch (e2) {}
    })

    // 兜底：请求完成后尝试解析
    task.onComplete = function () {
      if (that._cleanedUp) return
      that._requestTask = null
      that.setData({ generating: false })
      if (finalShots.length === 0 && fullText.length > 0) {
        var parsed = extractJsonArray(fullText)
        if (parsed && parsed.length > 0) {
          var shots = parsed.map(function (s, j) { s.expanded = j === 0; s.copied = false; s.shotSizeClass = getShotSizeClass(s.shot_size); return s })
          var dur = shots.reduce(function (sum, s) { return sum + (s.duration || 0) }, 0)
          that.setData({ shots: shots, totalDuration: dur, status: '生成完成 · ' + shots.length + ' 镜 · 总' + dur + '秒', statusType: 'success' })
        } else {
          that.setData({ status: '解析失败，请重试', statusType: 'error' })
        }
      } else if (finalShots.length > 0) {
        that.setData({ status: '生成完成 · ' + finalShots.length + ' 镜', statusType: 'success' })
      } else {
        that.setData({ status: '未获取到内容，请重试', statusType: 'error' })
      }
    }
  },

  toggleCard: function (e) {
    var idx = e.currentTarget.dataset.index
    var shots = this.data.shots
    shots[idx].expanded = !shots[idx].expanded
    this.setData({ shots: shots })
  },

  copyShot: function (e) {
    var idx = e.currentTarget.dataset.index
    var shot = this.data.shots[idx]
    var text = '镜' + shot.id + ' | ' + (shot.shot_size || '') + ' | ' + (shot.duration || 0) + 's\n'
    var fields = [
      ['🎥 机位镜头', shot.camera_setup],
      ['🎨 美术视觉', shot.visual_art],
      ['🎭 内容描述', shot.content_description],
      ['💬 台词', shot.dialogue],
      ['🎙️ 旁白/独白', shot.voiceover],
      ['🔊 音效/音乐', shot.sound_effects],
      ['👔 道具/服装', shot.props_costumes],
      ['📝 备注', shot.remarks]
    ]
    fields.forEach(function (f) { if (f[1] && f[1] !== '无') text += '\n' + f[0] + ': ' + f[1] })
    wx.setClipboardData({
      data: text,
      success: function () {
        var shots = that.data.shots
        if (shots[idx]) shots[idx].copied = true
        that.setData({ shots: shots })
        wx.showToast({ title: '已复制', icon: 'success', duration: 1500 })
        setTimeout(function () {
          if (that.data.shots[idx]) { shots[idx].copied = false; that.setData({ shots: shots }) }
        }, 2500)
      }
    })
    var that = this
  },

  handleExport: function () {
    if (this.data.shots.length === 0 || this.data.exporting) return
    var that = this
    this.setData({ exporting: true })
    // 生成纯文本导出（小程序无法直接下载xlsx，改为复制全文）
    var text = 'AI分镜脚本\n\n'
    this.data.shots.forEach(function (s) {
      text += '━━━━━━━━━━━━\n镜 ' + s.id + ' | ' + (s.shot_size || '') + ' | ' + (s.camera_movement || '') + ' | ' + (s.duration || 0) + 's\n\n'
      if (s.camera_setup) text += '🎥 机位: ' + s.camera_setup + '\n'
      if (s.visual_art) text += '🎨 美术: ' + s.visual_art + '\n'
      if (s.content_description) text += '🎭 动作: ' + s.content_description + '\n'
      if (s.dialogue && s.dialogue !== '无') text += '💬 台词: ' + s.dialogue + '\n'
      if (s.voiceover && s.voiceover !== '无') text += '🎙️ 旁白: ' + s.voiceover + '\n'
      if (s.sound_effects) text += '🔊 音效: ' + s.sound_effects + '\n'
      if (s.props_costumes) text += '👔 道具: ' + s.props_costumes + '\n'
      if (s.remarks) text += '📝 备注: ' + s.remarks + '\n'
      text += '\n'
    })
    text += '━━━━━━━━━━━━\n共 ' + this.data.shots.length + ' 镜 · 总时长 ' + this.data.totalDuration + ' 秒'
    wx.setClipboardData({
      data: text,
      success: function () {
        that.setData({ exporting: false })
        wx.showToast({ title: '全文已复制', icon: 'success', duration: 2000 })
      },
      fail: function () { that.setData({ exporting: false }) }
    })
  },

  handleShare: function () {
    var that = this
    if (this.data.shots.length === 0) return
    var title = this.data.theme.slice(0, 20) || '分镜脚本'
    wx.showActionSheet({
      itemList: ['发送给微信好友', '复制分享文案'],
      success: function (res) {
        if (res.tapIndex === 0) {
          wx.showToast({ title: '点击右上角 ··· 分享给朋友', icon: 'none', duration: 2000 })
        } else if (res.tapIndex === 1) {
          wx.setClipboardData({
            data: title + ' - AI分镜脚本\n\n共' + that.data.shots.length + '镜 · 总' + that.data.totalDuration + '秒\n\n打开小程序搜：StoryboardAI',
            success: function () { wx.showToast({ title: '已复制分享文案', icon: 'success' }) }
          })
        }
      }
    })
  }
})
