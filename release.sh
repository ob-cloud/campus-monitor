#!/bin/bash

cd dist
tar -cvz -f release.tar.gz .
cp release.tar.gz ../
rm release.tar.gz
