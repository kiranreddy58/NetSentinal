import os

configs = {
    'core-site.xml': """<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>fs.defaultFS</name>
        <value>hdfs://localhost:9000</value>
        <description>The name of the default file system.</description>
    </property>
    <property>
        <name>hadoop.tmp.dir</name>
        <value>C:/Users/kiran/OneDrive/Documents/bda/hadoop_data/temp</value>
        <description>A base for other temporary directories.</description>
    </property>
</configuration>""",

    'hdfs-site.xml': """<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>dfs.replication</name>
        <value>1</value>
        <description>Default block replication.</description>
    </property>
    <property>
        <name>dfs.namenode.name.dir</name>
        <value>file:///C:/Users/kiran/OneDrive/Documents/bda/hadoop_data/namenode</value>
        <description>Where the NameNode stores metadata.</description>
    </property>
    <property>
        <name>dfs.datanode.data.dir</name>
        <value>file:///C:/Users/kiran/OneDrive/Documents/bda/hadoop_data/datanode</value>
        <description>Where DataNode stores blocks.</description>
    </property>
    <property>
        <name>dfs.permissions.enabled</name>
        <value>false</value>
        <description>Disable permission checking for single-node development.</description>
    </property>
</configuration>""",

    'mapred-site.xml': """<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>mapreduce.framework.name</name>
        <value>yarn</value>
        <description>The runtime framework for executing MapReduce jobs.</description>
    </property>
    <property>
        <name>mapreduce.application.classpath</name>
        <value>%HADOOP_HOME%/share/hadoop/mapreduce/*,%HADOOP_HOME%/share/hadoop/mapreduce/lib/*,%HADOOP_HOME%/share/hadoop/common/*,%HADOOP_HOME%/share/hadoop/common/lib/*,%HADOOP_HOME%/share/hadoop/yarn/*,%HADOOP_HOME%/share/hadoop/yarn/lib/*,%HADOOP_HOME%/share/hadoop/hdfs/*,%HADOOP_HOME%/share/hadoop/hdfs/lib/*</value>
    </property>
</configuration>""",

    'yarn-site.xml': """<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
    <property>
        <name>yarn.nodemanager.aux-services</name>
        <value>mapreduce_shuffle</value>
        <description>Auxiliary services of NodeManager.</description>
    </property>
    <property>
        <name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
        <value>org.apache.hadoop.mapred.ShuffleHandler</value>
    </property>
    <property>
        <name>yarn.resourcemanager.hostname</name>
        <value>localhost</value>
    </property>
    <property>
        <name>yarn.nodemanager.env-whitelist</name>
        <value>JAVA_HOME,HADOOP_COMMON_HOME,HADOOP_HDFS_HOME,HADOOP_CONF_DIR,CLASSPATH_PREPEND_DISTCACHE,HADOOP_YARN_HOME,HADOOP_HOME,PATH,LANG,TZ</value>
    </property>
</configuration>"""
}

dest_dirs = [
    os.path.join('tools', 'hadoop-3.3.6', 'etc', 'hadoop'),
    os.path.join('hadoop', 'config')
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)
    for name, content in configs.items():
        fp = os.path.join(d, name)
        with open(fp, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Wrote {fp}")

print("All Hadoop XML configurations created successfully.")
