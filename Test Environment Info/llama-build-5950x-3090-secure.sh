#!/bin/bash

set -e
set -x
https://aka.ms/vscode-workspace-trust
# Move to your local source folder
cd ./llama.cpp

# Clear out any corrupted build cache layouts entirely
rm -rf build && mkdir build && cd build

# Execute the 100% optimal architecture target build string
cmake .. \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_C_COMPILER=/usr/bin/gcc-14 \
  -DCMAKE_CXX_COMPILER=/usr/bin/g++-14 \
  -DCMAKE_CUDA_HOST_COMPILER=/usr/bin/g++-14 \
  -DGGML_CUDA=ON \
  -DGGML_CUDA_NCCL=OFF \
  -DGGML_NATIVE=ON \
  -DGGML_LTO=ON \
  -DLLAMA_SERVER=ON \
  -DLLAMA_BUILD_EXAMPLES=OFF \
  -DLLAMA_BUILD_TESTS=OFF \
  -DGGML_CUDA_FA_QUANTS="q4_0-q4_0;q8_0-q4_0;q8_0-q5_0;q8_0-q8_0;f16-f16;bf16-bf16" \
  -DCMAKE_CUDA_ARCHITECTURES="86-real;61-real" \
  -DCMAKE_CXX_FLAGS="-march=znver3 -O3" \
  -DCMAKE_C_FLAGS="-march=znver3 -O3" \
  -DCMAKE_CUDA_FLAGS="-O3 -Xcompiler -O3" \
	>./c.log 2>&1
#  -DCMAKE_INTERPROCEDURAL_OPTIMIZATION=ON \

# Compile using all 16 physical cores of your 5950X
time (cmake --build . --config Release -j 22 >./b.log 2>&1 || echo "error")
