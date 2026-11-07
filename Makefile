ARCHES := x86 arm
# Overrides to s9pk.mk must precede the include statement.
# ncc honors restrictive umasks; the service runtime must be able to read the bundle.
JS_BUNDLE = rm -rf javascript && npx ncc build startos/index.ts -o javascript && chmod -R a+rX javascript
include node_modules/@start9labs/start-sdk/s9pk.mk
