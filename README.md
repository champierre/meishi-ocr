# meishi-ocr

meishi-ocrは、名刺の画像を撮影すると、それをスキャンし、抽出した情報を自動的にGoogleスプレッドシートに追加するサンプルです。OCR（光学文字認識）にはGoogle Cloud Vision APIを利用し、抽出したテキスト情報をOpenAI APIを使って会社名や氏名などの各項目に構造化し、Googleスプレッドシートに書き込みます。

## 準備

meishi-ocrを使うには、

- Google Cloud Vision APIを使うためのAPIキー
- OpenAI APIを使うためのAPIキー
- GoogleスプレッドシートとそれにアクセスするためのAPIのURL

が必要です。

## 使い方

- https://champierre.github.io/meishi-ocr/ を開きます。
- Google Cloud Vision API Key、OpenAI API Key、Google Sheet API URLを用意し、それぞれを入力します。
- 「ファイルを選択」ボタンを押し、名刺の画像をカメラで直接撮影するか、あらかじめ撮ってある画像を選択してアップロードします。
- 画像から読み取った情報を構造化した結果が「読み取りデータ」に表示され、用意したGoogleスプレッドシートに追加されます。
