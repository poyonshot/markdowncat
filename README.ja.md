# MarkdownCat

複数の Markdown ファイルを結合して１つの Markdown ファイルを作成します。

## 使い方

### マークダウンファイルをインクルードする
1. 拡張子が .mdcat  のファイルを作成します
1. 作成した .mdcat ファイルを開きます
1. 結合したい Markdown ファイルを $include="ファイル名" の形式で記述します
1. ポップアップメニューの「Markdown ファイルを作成」を選ぶとMarkdown ファイルを作成します。

![使い方](images/usage.gif)

### CSSファイルをインクルードする

$includeで cssファイルをインクルードすると \<style\>で囲って出力します。

![使い方](images/usage-css.gif)

## License

The source code and strings are licensed under the [MIT](license.md) license.
