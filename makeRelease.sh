
source build-tools/assertions.sh

assertGitRepo
assertCleanRepo

VERSION="$1"

assertVersion $VERSION
assertGitTagAvailable v$VERSION

npm test
assertLastCall

npm run build:debug
assertLastCall

npm version $VERSION-debug --no-commit-hooks --no-git-tag-version
assertLastCall

npm publish --tag debug
assertLastCall

git checkout -- package.json package-lock.json

npm run build
npm version $VERSION
npm publish

git add package.json package-lock.json
git commit -m "Release: $VERSION"
git tag -a v$VERSION -m "Release: $VERSION"
git push
git push --tags
