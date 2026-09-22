#!/bin/bash
note=${1:-}
note="${note:+${note}-}"
d=$(date '+%Y%m%d-%H%M%S')

tdir=logs

mkdir -p "./$tdir"

journalctl --user -u llama-server |
tac | 
sed  '/Started Llama.cpp Custom Master Server @RESTART@./,$d' | 
tac > "${tdir}/${tdir}-${note}llama-server-${d}.log"
