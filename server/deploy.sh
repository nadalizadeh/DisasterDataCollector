rsync $1 -rlptDvz --delete --exclude-from=rsync-exclude.txt -e "ssh -v" ./ root@rootshell.ir:/home/web/rootshell.ir/disaster/
