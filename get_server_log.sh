#!/bin/bash
tdir=${1:-.}

journalctl --user -u llama-server |
tac | 
sed  '/Started Llama.cpp Custom Master Server @RESTART@./,$d' | 
tac > "${tdir}/llama-server.log"
