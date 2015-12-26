aws s3 cp --recursive ./gits/yamd "s3://yamd.xuanji.li/" --exclude ".git/*" --exclude "node_modules/*" --acl public-read
