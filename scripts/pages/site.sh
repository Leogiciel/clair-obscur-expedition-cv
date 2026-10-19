#!/bin/sh
# Assembles the GitHub Pages site from `GITHUB_PAGES=true react-router build`: the prerendered pages sit under the
# base path, which Pages already serves the artifact at, so they move to the root of site/; unknown URLs fall back to
# the client app.
set -eu
rm -rf site
mkdir site
cp -R build/client/clair-obscur-expedition-cv/. site/
find build/client -mindepth 1 -maxdepth 1 ! -name clair-obscur-expedition-cv -exec cp -R {} site/ \;
cp site/__spa-fallback.html site/404.html
