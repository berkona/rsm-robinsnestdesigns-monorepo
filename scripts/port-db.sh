#!/usr/bin/env bash

source ../.env

source_endpoint_arn="$1"
target_endpoint_arn="$2"

echo "Creating replication instance"

aws --region us-east-1 dms create-replication-instance --replication-instance-identifier dms-instance --replication-instance-class dms.t2.micro --allocated-storage 50

rep_instance_arn=$(aws --region us-east-1 dms describe-replication-instances --filter=Name=replication-instance-id,Values=dms-instance --query 'ReplicationInstances[0].ReplicationInstanceArn' --output text)

echo "Waiting for replication instance $rep_instance_arn"

task_status="need-to-check"

while [ "$task_status" != "available" ] ; do
  sleep 1
  task_status=$(aws --region us-east-1 dms describe-replication-instances --filter=Name=replication-instance-id,Values=dms-instance --query 'ReplicationInstances[0].ReplicationInstanceStatus' --output text)
  # echo "Replication instance status: $task_status"
done

echo "Replication instance created"

echo "Testing connections"

aws --region us-east-1 dms test-connection --replication-instance-arn $rep_instance_arn --endpoint-arn $source_endpoint_arn

aws --region us-east-1 dms test-connection --replication-instance-arn $rep_instance_arn --endpoint-arn $target_endpoint_arn

task_status="need-to-check"

while [ "$task_status" != "successful" ] ; do
  sleep 1
  task_status=$(aws --region us-east-1 dms describe-connections --filter "Name=endpoint-arn,Values=$source_endpoint_arn" --query "Connections[0].Status" --output text)
  if [ "$task_status" == "failed" ] ; then
    echo "Test failed, cancel and try again"
  fi
done

task_status="need-to-check"

while [ "$task_status" != "successful" ] ; do
  sleep 1
  task_status=$(aws --region us-east-1 dms describe-connections --filter "Name=endpoint-arn,Values=$target_endpoint_arn" --query "Connections[0].Status" --output text)
  if [ "$task_status" == "failed" ] ; then
    echo "Test failed, cancel and try again"
  fi
done

echo "Creating replication task"

aws --region us-east-1 dms create-replication-task --replication-task-identifier replication-task-1 --source-endpoint-arn $source_endpoint_arn --target-endpoint-arn $target_endpoint_arn --replication-instance-arn $rep_instance_arn --migration-type full-load --table-mappings file://table-mappings.json --replication-task-settings file://task-settings.json

replication_task_arn=$(aws --region us-east-1 dms describe-replication-tasks --filters "Name= replication-task-id,Values=replication-task-1" --query "ReplicationTasks[0].ReplicationTaskArn" --output text)

# wait for replication task to finish
task_status="need-to-check"

echo "Waiting for migration task to finish creating..."

while [ "$task_status" != "ready" ] ; do
  sleep 1
  # wait for replication task to finish TODO
  task_status=$(aws --region us-east-1 dms describe-replication-tasks --filters "Name=replication-task-arn,Values=$replication_task_arn" --query "ReplicationTasks[0].Status" --output text)
done

echo "Starting migration $replication_task_arn"

aws --region us-east-1 dms start-replication-task --replication-task-arn $replication_task_arn --start-replication-task-type start-replication

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
mysql --ssl --port=$SQL_PORT --host="$SQL_HOST" --user="$SQL_USER" --password="$SQL_PWD" "$SQL_DB" < post-migration.sql

echo "Migration finished"

echo "Deleting replication task..."

aws --region us-east-1 dms delete-replication-task --replication-task-arn $replication_task_arn

# wait for replication task to finish
task_status="deleting"

while [ "$task_status" == "deleting" ] ; do
  sleep 1
  # wait for replication task to finish TODO
  task_status=$(aws --region us-east-1 dms describe-replication-tasks --filters "Name=replication-task-arn,Values=$replication_task_arn" --query "ReplicationTasks[0].Status" --output text)
done

echo "Deleting replication instance..."

aws --region us-east-1 dms delete-replication-instance --replication-instance-arn $rep_instance_arn

echo "Done"
