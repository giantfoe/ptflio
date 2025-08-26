#!/bin/bash

jq -r ".[].name" temp_repos.json | while read repo; do
  if curl -s -f "https://api.github.com/repos/giantfoe/$repo/readme" -H "Accept: application/vnd.github.v3.raw" -o "readmes/${repo}_README.md"; then
    echo "Fetched README for $repo"
  else
    echo "No README for $repo"
  fi
done
