node_modules/babel-cli/bin/babel.js src --out-file yamd.js --presets es2015,react
aws s3 cp --recursive . "s3://yamd.xuanji.li/" --exclude ".git/*" --exclude "node_modules/*" --acl public-read
