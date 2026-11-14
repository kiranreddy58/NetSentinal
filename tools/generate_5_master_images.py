#!/usr/bin/env python3
"""
NetSentinel - Composite Image Generator
Combines high-res UI dashboard screenshots with genuine terminal command outputs
into 5 presentation-ready master images in the `output/` folder.
"""

import os
from PIL import Image, ImageDraw, ImageFont

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCREENSHOTS_DIR = os.path.join(PROJECT_ROOT, "docs", "screenshots")
TERMINAL_DIR = os.path.join(PROJECT_ROOT, "docs", "terminal_logs")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Font loading helper
def get_font(size, bold=False):
    # Try common Windows monospaced / system fonts
    font_candidates = [
        "consola.ttf", "consolab.ttf" if bold else "consola.ttf",
        "arial.ttf", "calibri.ttf", "cour.ttf"
    ]
    for fc in font_candidates:
        try:
            return ImageFont.truetype(fc, size)
        except Exception:
            continue
    return ImageFont.load_default()

def render_terminal_panel(width, height, title, lines, command_title="COMMAND"):
    img = Image.new("RGB", (width, height), color=(15, 23, 42)) # slate-900
    draw = ImageDraw.Draw(img)
    
    # Header bar
    draw.rectangle([(0, 0), (width, 42)], fill=(30, 41, 59)) # slate-800
    draw.line([(0, 42), (width, 42)], fill=(51, 65, 85), width=2)
    
    # Terminal dots
    draw.ellipse([(14, 15), (24, 25)], fill=(239, 68, 68)) # red
    draw.ellipse([(32, 15), (42, 25)], fill=(234, 179, 8)) # yellow
    draw.ellipse([(50, 15), (60, 25)], fill=(34, 197, 94)) # green
    
    title_font = get_font(16, bold=True)
    draw.text((80, 12), f"Terminal — {title}", fill=(226, 232, 240), font=title_font)
    
    # Text area
    font = get_font(15)
    y = 55
    line_height = 20
    
    for l in lines:
        if y + line_height > height - 10:
            break
        # Color syntax
        color = (148, 163, 184) # slate-400 default
        sl = l.strip()
        if sl.startswith("COMMAND:") or sl.startswith("$"):
            color = (56, 189, 248) # sky-400
        elif sl.startswith("===") or sl.startswith("---") or sl.startswith("Live datanodes"):
            color = (250, 204, 21) # yellow-400
        elif "SUCCESS" in sl or "Normal" in sl or "HEALTHY" in sl or "PASSED" in sl or "OK" in sl:
            color = (74, 222, 128) # green-400
        elif "ERROR" in sl or "Corrupt" in sl or "Missing" in sl:
            color = (248, 113, 113) # red-400
            
        draw.text((20, y), l, fill=color, font=font)
        y += line_height
        
    return img

def create_composite(ui_img_path, term_file_path, term_title, output_filename, header_badge="NETSENTINEL ARCHITECTURE & TELEMETRY"):
    ui_img = Image.open(ui_img_path).convert("RGB")
    
    # Read terminal text
    with open(term_file_path, "r", encoding="utf-8") as f:
        term_text = f.read()
    term_lines = [l for l in term_text.splitlines() if l.strip()]
    
    # Dimensions: Canvas width = 1920, Height = 1080 (UI scaled to 1920x800) + 400 (Terminal panel) = 1920x1260
    canvas_w = 1920
    header_h = 60
    ui_h = 760
    term_h = 440
    canvas_h = header_h + ui_h + term_h
    
    master = Image.new("RGB", (canvas_w, canvas_h), color=(10, 15, 29))
    draw = ImageDraw.Draw(master)
    
    # Master Header
    draw.rectangle([(0, 0), (canvas_w, header_h)], fill=(15, 23, 42))
    draw.line([(0, header_h), (canvas_w, header_h)], fill=(56, 189, 248), width=2)
    
    title_font = get_font(22, bold=True)
    draw.text((30, 16), f"NetSentinel | {header_badge}", fill=(248, 250, 252), font=title_font)
    
    badge_font = get_font(14, bold=True)
    draw.text((canvas_w - 380, 20), "Apache Hadoop 3.3.6 • Live HDFS • React UI", fill=(56, 189, 248), font=badge_font)
    
    # UI Panel (Resized smoothly)
    ui_resized = ui_img.resize((canvas_w, ui_h), Image.Resampling.LANCZOS)
    master.paste(ui_resized, (0, header_h))
    
    # Terminal Panel
    term_panel = render_terminal_panel(canvas_w, term_h, term_title, term_lines)
    master.paste(term_panel, (0, header_h + ui_h))
    
    # Border line separating UI and Terminal
    draw.line([(0, header_h + ui_h), (canvas_w, header_h + ui_h)], fill=(56, 189, 248), width=2)
    
    out_path = os.path.join(OUTPUT_DIR, output_filename)
    master.save(out_path, quality=95)
    print(f"Generated master image: {out_path} ({canvas_w}x{canvas_h})")

def main():
    print("Generating the 5 essential combined images in output/ ...")
    
    # 1. System Overview + HDFS DFSAdmin Live Cluster Report
    create_composite(
        ui_img_path=os.path.join(SCREENSHOTS_DIR, "01_system_overview.png"),
        term_file_path=os.path.join(TERMINAL_DIR, "02_hdfs_dfsadmin_report.txt"),
        term_title="hdfs dfsadmin -report (Live DataNode Capacity & DFS Block Health)",
        output_filename="1_system_overview_and_hdfs_report.png",
        header_badge="DASHBOARD OVERVIEW & HDFS CLUSTER HEALTH"
    )
    
    # 2. Source IP Analytics (Job 1) + Ingested Datasets in HDFS
    create_composite(
        ui_img_path=os.path.join(SCREENSHOTS_DIR, "02_source_ip_analytics.png"),
        term_file_path=os.path.join(TERMINAL_DIR, "04_hdfs_ls_input_original.txt"),
        term_title="hdfs dfs -ls -h /netsentinel/input/original (Canonical Monday-Friday CSVs)",
        output_filename="2_source_ip_analytics_and_hdfs_datasets.png",
        header_badge="SOURCE IP ANALYTICS (JOB 1) & CANONICAL HDFS STORAGE"
    )
    
    # 3. Port & Protocol Intelligence (Jobs 3 & 4) + Reducer Output Inspection
    create_composite(
        ui_img_path=os.path.join(SCREENSHOTS_DIR, "04_port_intelligence.png"),
        term_file_path=os.path.join(TERMINAL_DIR, "09_hdfs_cat_sample_job_output.txt"),
        term_title="hdfs dfs -cat /netsentinel/output/job4_protocol_*/part-00000 (MapReduce Partition Output)",
        output_filename="3_port_protocol_intelligence_and_mapreduce_output.png",
        header_badge="PORT & PROTOCOL INTELLIGENCE & HDFS REDUCER OUTPUTS"
    )
    
    # 4. Attack Taxonomy & Suspicious Heuristics (Jobs 7 & 9) + HDFS Storage & Quota
    create_composite(
        ui_img_path=os.path.join(SCREENSHOTS_DIR, "09_attack_taxonomy.png"),
        term_file_path=os.path.join(TERMINAL_DIR, "07_hdfs_count_storage.txt"),
        term_title="hdfs dfs -count -q -h -v (Filesystem Block Counts & Directory Quotas)",
        output_filename="4_attack_taxonomy_and_hdfs_storage_metrics.png",
        header_badge="ATTACK TAXONOMY (27 CLASSES) & HDFS STORAGE QUOTAS"
    )
    
    # 5. MapReduce Provenance & Audit + HDFS All Output Directories
    create_composite(
        ui_img_path=os.path.join(SCREENSHOTS_DIR, "12_mapreduce_provenance.png"),
        term_file_path=os.path.join(TERMINAL_DIR, "06_hdfs_ls_all_outputs.txt"),
        term_title="hdfs dfs -ls -h /netsentinel/output (All 10 MapReduce Output Directories)",
        output_filename="5_mapreduce_provenance_and_hdfs_job_directories.png",
        header_badge="MAPREDUCE EXECUTION PROVENANCE & DISTRIBUTED OUTPUTS"
    )

if __name__ == '__main__':
    main()
