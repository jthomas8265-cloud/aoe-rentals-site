#!/usr/bin/env python3
"""Sanitize Grey's brief HTML into data/brief.html.
Usage: python3 tools/sanitize_brief.py /workspace/community-brief/brief-latest.html data/brief.html
Allowlist tags only; drops script/style/iframe/etc. and all on* attrs; keeps http(s)/mailto links."""
import sys, html
from html.parser import HTMLParser
OK = {"section","footer","div","article","header","h2","h3","h4","p","ul","ol","li","a","strong","b","em","i","small","span","time","br","hr","table","thead","tbody","tr","th","td"}
DROP = {"script","style","iframe","object","embed","form","noscript","template","svg","head","title","meta","link"}
VOID = {"br","hr"}
class S(HTMLParser):
    def __init__(s): super().__init__(convert_charrefs=True); s.o=[]; s.skip=0
    def handle_starttag(s,t,a):
        if t in DROP: s.skip+=t not in VOID; return
        if s.skip or t not in OK: return
        at=""
        for k,v in a:
            v=v or ""
            if k=="href" and t=="a" and v.strip().lower().startswith(("http://","https://","mailto:")):
                at+=f' href="{html.escape(v.strip())}" target="_blank" rel="noopener nofollow"'
            elif k in ("class","datetime","colspan"): at+=f' {k}="{html.escape(v)}"'
        s.o.append(f"<{t}{at}>")
    def handle_endtag(s,t):
        if t in DROP: s.skip=max(0,s.skip-1); return
        if not s.skip and t in OK and t not in VOID: s.o.append(f"</{t}>")
    def handle_data(s,d):
        if not s.skip: s.o.append(html.escape(d))
p=S(); p.feed(open(sys.argv[1],encoding="utf-8").read())
open(sys.argv[2],"w",encoding="utf-8").write("".join(p.o).strip()+"\n")
