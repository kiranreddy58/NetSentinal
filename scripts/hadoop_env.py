import os
import subprocess
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JDK_DIR = os.path.join(BASE_DIR, "tools", "jdk-11")
HADOOP_DIR = os.path.join(BASE_DIR, "tools", "hadoop-3.3.6")
CONF_DIR = os.path.join(HADOOP_DIR, "etc", "hadoop")

def get_env():
    env = os.environ.copy()
    env["JAVA_HOME"] = JDK_DIR
    env["HADOOP_HOME"] = HADOOP_DIR
    env["HADOOP_CONF_DIR"] = CONF_DIR
    env["HADOOP_COMMON_HOME"] = HADOOP_DIR
    env["HADOOP_HDFS_HOME"] = HADOOP_DIR
    env["HADOOP_MAPRED_HOME"] = HADOOP_DIR
    env["HADOOP_YARN_HOME"] = HADOOP_DIR
    
    python_dir = os.path.dirname(sys.executable)
    # Minimal PATH to prevent cmd for-loop lag, while ensuring python, hadoop, java, and system utilities are available
    env["PATH"] = (
        os.path.join(HADOOP_DIR, "bin") + ";" +
        os.path.join(JDK_DIR, "bin") + ";" +
        python_dir + ";" +
        r"C:\Windows\System32" + ";" +
        r"C:\Windows"
    )
    return env

def run_hadoop(args, timeout=120):
    cmd = [os.path.join(HADOOP_DIR, "bin", "hadoop.cmd")] + args
    return subprocess.run(cmd, env=get_env(), capture_output=True, text=True, timeout=timeout)

def run_hdfs(args, timeout=120):
    cmd = [os.path.join(HADOOP_DIR, "bin", "hdfs.cmd")] + args
    return subprocess.run(cmd, env=get_env(), capture_output=True, text=True, timeout=timeout)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python hadoop_env.py [hadoop|hdfs] [args...]")
        sys.exit(1)
    tool = sys.argv[1].lower()
    sub_args = sys.argv[2:]
    if tool == "hadoop":
        res = run_hadoop(sub_args)
    elif tool == "hdfs":
        res = run_hdfs(sub_args)
    else:
        print(f"Unknown tool: {tool}")
        sys.exit(1)
    print("STDOUT:\n", res.stdout)
    if res.stderr:
        print("STDERR:\n", res.stderr)
    print("EXIT CODE:", res.returncode)
    sys.exit(res.returncode)
