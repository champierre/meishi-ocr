# meishi-ocr

meishi-ocrは、名刺の画像を撮影すると、それをスキャンし、抽出した情報を自動的にGoogleスプレッドシートに追加するサンプルです。OCR（光学文字認識）にはGoogle Cloud Vision APIを利用し、抽出したテキスト情報をOpenAI APIを使って会社名や氏名などの各項目に構造化し、Googleスプレッドシートに書き込みます。

## 準備

meishi-ocrを使うには、

1. Google Cloud Vision APIを使うためのAPIキー
2. OpenAI APIを使うためのAPIキー
3. GoogleスプレッドシートとそれにアクセスするためのAPIのURL

が必要です。

Google Cloud Vision APIを使うためのAPIキーは、[API Keyを発行する手順 for Google Cloud API](https://zenn.dev/tmitsuoka0423/articles/get-gcp-api-key)などを参考にしながら発行してください。これをのちほどGoogle Cloud Vision API Keyの欄にコピーします。

OpenAI APIを使うためのAPIキーは、[openai api を発行するまでの手順など](https://qiita.com/Satoshi_Numasawa/items/8ab455ef0f97e61ae0e5)などを参考にしながら発行してください。これをのちほどOpenAI API Keyの欄にコピーします。

GoogleスプレッドシートとそれにアクセスするためのGoogle Sheet API URLを発行するには以下の手順が必要です。

- [テンプレートのGoogleスプレッドシート](https://docs.google.com/spreadsheets/d/1N3q71PlfKOf3FrTeT8PJPATgc7XjpGFkctt4_Cd6trk/edit?usp=sharing)をコピーして自分専用のスプレッドシートを用意します。
- Googleスプレッドシートのメニューより、[拡張機能] > [Apps Script] を選び、APIの役割をする Google Apps Scriptを開きます。
- [デプロイ] > [新しいデプロイ] を選び、「次のユーザーとして実行」には「自分」を、「アクセスできるユーザー」には「全員」が選ばれていることを確認して、「デプロイ」ボタンを押してデプロイします。
- デプロイが完了したら、ウェブアプリのURLをコピーします。これをのちほどGoogle Sheet API URLの欄にコピーします。

## 使い方

- https://champierre.github.io/meishi-ocr/ を開きます。
- Google Cloud Vision API Key、OpenAI API Key、Google Sheet API URLを用意し、それぞれを入力します。
- 「ファイルを選択」ボタンを押し、名刺の画像をカメラで直接撮影するか、あらかじめ撮ってある画像を選択してアップロードします。
- 画像から読み取った情報を構造化した結果が「読み取りデータ」に表示され、用意したGoogleスプレッドシートに追加されます。