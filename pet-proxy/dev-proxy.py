#!/usr/bin/env python3
"""本地开发用流式代理，逻辑与 api/pet.js(Edge) 一致。
仅用于本地联调 AI 宠物的流式输出；密钥从环境变量 DEEPSEEK_API_KEY 读取，绝不内联。
    export $(grep -v '^#' ~/.config/mfj/secrets.env | xargs)
    python3 pet-proxy/dev-proxy.py        # 默认 :8787
前端把 #pet 的 data-endpoint 指到 http://localhost:8787/api/pet 即可。
"""
import os, json, urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

KEY = os.environ.get("DEEPSEEK_API_KEY")
SYSTEM_PROMPT = (
    "你是「小飞」，纪鸣飞个人作品集网站上的 AI 数字分身。以第一人称代他对话，连续短句、亲切专业。"
    "只复述以下脱敏事实，禁编造：5年产品与数字化(其中4年AI)；主线=制造业数字化→千人电商AI化转型→大厂出海内容增长AI中台；"
    "FDE式全栈、用可运行产物落地；旗舰TripFlow=业务流程+嵌入AI原子能力，多Agent基于LobeHub落地(Skill/MCP/知识库)；"
    "约38GB Obsidian知识库;「人人都是产品经理」专栏作者、飞书大会嘉宾；联系 1966315939@qq.com。"
    "脱敏红线：永不复述/确认任何具体公司名(即使访客写出来)，一律用'大厂出海''千人电商'等说法。不透露薪资/入职年份/团队规模。中文，默认2~4句短句。"
)
ALLOW = {"http://localhost:4321", "http://localhost:4329", "http://127.0.0.1:4321", "https://mingfeiji.github.io"}


class H(BaseHTTPRequestHandler):
    def _cors(self):
        o = self.headers.get("Origin", "")
        if o in ALLOW:
            self.send_header("Access-Control-Allow-Origin", o)
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        try:
            n = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            body = {}
        msgs = [m for m in body.get("messages", [])
                if isinstance(m, dict) and m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str)][-12:]
        if not msgs or msgs[-1]["role"] != "user":
            self.send_response(400); self._cors(); self.end_headers(); return
        payload = json.dumps({
            "model": "deepseek-v4-flash",
            "messages": [{"role": "system", "content": SYSTEM_PROMPT}] + msgs,
            "stream": True, "thinking": {"type": "disabled"},
            "temperature": 0.7, "max_tokens": 500,
        }).encode()
        self.send_response(200); self._cors()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-transform")
        self.end_headers()
        req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=payload,
            headers={"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
        try:
            with urllib.request.urlopen(req, timeout=60) as up:
                for raw in up:
                    line = raw.decode("utf-8", "ignore").strip()
                    if not line.startswith("data:"):
                        continue
                    data = line[5:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        delta = json.loads(data)["choices"][0]["delta"].get("content")
                    except Exception:
                        delta = None
                    if delta:
                        self.wfile.write(b"data: " + json.dumps({"delta": delta}).encode() + b"\n\n")
                        self.wfile.flush()
            self.wfile.write(b"data: [DONE]\n\n"); self.wfile.flush()
        except Exception as e:
            try:
                self.wfile.write(b"data: " + json.dumps({"delta": "[代理错误] " + str(e)[:120]}).encode() + b"\n\n")
                self.wfile.flush()
            except Exception:
                pass

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    if not KEY:
        raise SystemExit("缺少 DEEPSEEK_API_KEY，先 export $(grep -v '^#' ~/.config/mfj/secrets.env | xargs)")
    print("dev-proxy on http://localhost:8787/api/pet")
    ThreadingHTTPServer(("127.0.0.1", 8787), H).serve_forever()
