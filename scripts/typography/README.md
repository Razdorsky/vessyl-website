# Fixed display typography

Normal development, export and GitHub builds use the checked-in `public/typography/*.svg` artwork. No system font or Swift installation is needed to view or build the site. Roboto UI text remains ordinary bundled web text.

`lib/typography-art.json` records each exact heading string, its style and desktop/mobile artwork dimensions. The `Heading` component retains the full string in accessible semantic HTML and chooses responsive artwork with `picture`.

To regenerate on macOS with the two authorized local font files outside this repository:

```sh
python3 scripts/typography/generate.py --regular /absolute/path/telugu-mn.ttf --bold /absolute/path/telugu-mn-bold.ttf
```

CoreText lays out text and exports the original glyph paths. It fails if Telugu MN is unavailable. The full font binaries are never copied into this project. H1 uses Bold; other display styles use Regular. Adding or changing a heading requires a matching manifest record: its ID is the unsigned FNV-1a hash of `style|text`, matching `Typography.tsx`. Run the normal build and copy checker afterwards; missing heading artwork fails validation.

This approach preserves fixed brand typography across platforms. It does not support arbitrary dynamic display strings without regeneration; ordinary interface labels use Roboto.
