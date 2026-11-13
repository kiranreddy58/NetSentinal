import os
import sys
import subprocess
import time
import socket
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JDK_DIR = os.path.join(BASE_DIR, "tools", "jdk-11")
HADOOP_DIR = os.path.join(BASE_DIR, "tools", "hadoop-3.3.6")
PID_FILE = os.path.join(BASE_DIR, "hadoop_data", "pids.json")
LOG_DIR = os.path.join(BASE_DIR, "hadoop_data", "logs")
os.makedirs(LOG_DIR, exist_ok=True)

def get_env():
    env = os.environ.copy()
    env["JAVA_HOME"] = JDK_DIR
    env["HADOOP_HOME"] = HADOOP_DIR
    env["HADOOP_CONF_DIR"] = os.path.join(HADOOP_DIR, "etc", "hadoop")
    env["HADOOP_COMMON_HOME"] = HADOOP_DIR
    env["HADOOP_HDFS_HOME"] = HADOOP_DIR
    env["HADOOP_MAPRED_HOME"] = HADOOP_DIR
    env["HADOOP_YARN_HOME"] = HADOOP_DIR
    env["PATH"] = (
        os.path.join(HADOOP_DIR, "bin") + ";" +
        os.path.join(JDK_DIR, "bin") + ";" +
        r"C:\Windows\System32" + ";" +
        r"C:\Windows"
    )
    return env

def is_port_open(host, port, timeout=2):
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def start_daemon(name, cmd_args):
    log_out = open(os.path.join(LOG_DIR, f"{name}.out"), "a")
    log_err = open(os.path.join(LOG_DIR, f"{name}.err"), "a")
    
    cmd = [os.path.join(HADOOP_DIR, "bin", "hdfs.cmd")] + cmd_args
    proc = subprocess.Popen(
        cmd,
        env=get_env(),
        stdout=log_out,
        stderr=log_err,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
    )
    return proc.pid

def start_all():
    print("Starting NetSentinel Hadoop HDFS cluster...")
    pids = {}
    
    # 1. Start NameNode
    print("  Starting NameNode...")
    nn_pid = start_daemon("namenode", ["namenode"])
    pids["namenode"] = nn_pid
    
    # Wait for NameNode IPC port (9000) or HTTP (9870)
    for _ in range(30):
        if is_port_open("localhost", 9000):
            print("  [OK] NameNode active on port 9000 (IPC) and 9870 (WebUI)!")
            break
        time.sleep(1)
    else:
        print("  [WARN] NameNode still starting or checking...")

    # 2. Start DataNode
    print("  Starting DataNode...")
    dn_pid = start_daemon("datanode", ["datanode"])
    pids["datanode"] = dn_pid
    
    for _ in range(30):
        if is_port_open("localhost", 9864) or is_port_open("localhost", 9866):
            print("  [OK] DataNode active!")
            break
        time.sleep(1)
    else:
        print("  [INFO] DataNode spawned, initializing block pool...")

    with open(PID_FILE, "w") as f:
        json.dump(pids, f, indent=2)
    print("Cluster start routine finished.")

def stop_all():
    print("Stopping Hadoop daemons...")
    if os.path.exists(PID_FILE):
        with open(PID_FILE) as f:
            pids = json.load(f)
        for name, pid in pids.items():
            print(f"  Killing {name} (PID {pid})...")
            try:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(pid)], capture_output=True)
            except Exception as e:
                print(f"    Error: {e}")
        os.remove(PID_FILE)
    print("Hadoop cluster stopped.")

def status():
    # Run jps from JDK
    jps_exe = os.path.join(JDK_DIR, "bin", "jps.exe")
    res = subprocess.run([jps_exe, "-l"], capture_output=True, text=True)
    print("=== Java Processes (JPS) ===")
    print(res.stdout)
    
    print("=== Port Verification ===")
    print("NameNode IPC (9000):", "OPEN" if is_port_open("localhost", 9000) else "CLOSED")
    print("NameNode Web (9870):", "OPEN" if is_port_open("localhost", 9870) else "CLOSED")
    print("DataNode Web (9864):", "OPEN" if is_port_open("localhost", 9864) else "CLOSED")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python hadoop_service.py [start|stop|status]")
        sys.exit(1)
    action = sys.argv[1].lower()
    if action == "start":
        start_all()
    elif action == "stop":
        stop_all()
    elif action == "status":
        status()
    else:
        print(f"Unknown action: {action}")
