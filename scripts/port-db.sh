#!/usr/bin/env bash

replication_task_arn=$1

echo "Starting migration $replication_task_arn"

aws --region=us-east-1 dms start-replication-task --replication-task-arn $replication_task_arn --start-replication-task-type reload-target

# wait for replication task to finish
task_status="need-to-check"

echo "Waiting for migration to finish..."

while [ "$task_status" != "stopped" ] ; do
  sleep 1
  # wait for replication task to finish TODO
  task_status=$(aws --region us-east-1 dms describe-replication-tasks --filters "Name=replication-task-arn,Values=$replication_task_arn" --query "ReplicationTasks[0].Status" --output text)
done

# run post migration script
echo "Running post-migration script"
mysql --ssl --host "$SQL_HOST" --user "$SQL_USER" --password="$SQL_PWD" "$SQL_DB" < post-migration.sh

echo "Migration finished"
