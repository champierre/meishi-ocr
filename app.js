const ocr_url = 'https://vision.googleapis.com/v1/images:annotate';
const openai_url = 'https://api.openai.com/v1/chat/completions';
const cookie_expires = 180;
let google_cloud_vision_api_key;
let openai_api_key;
let google_sheet_api_url;

document.addEventListener('DOMContentLoaded', function() {
  setupAPIKeys();
  setCurrentPosition();
  document.querySelector('#image').addEventListener('change', handleFileSelect);
});

function setupAPIKeys() {
  document.querySelector('#settings').value = Cookies.get('settings') || '';
}

function setCurrentPosition() {
  navigator.geolocation.getCurrentPosition((position) => {
    document.querySelector('#lat').value = position.coords.latitude;
    document.querySelector('#lng').value = position.coords.longitude;
  });
}

function handleFileSelect(e) {
  if (!e.target.files || e.target.files.length == 0) return;
  Promise.resolve(e.target.files[0])
    .then(readFile)
    .then(performOcr)
    .then(JSONification)
    .then(addData)
    .catch(err => {
      console.log(err);
    });
}

function readFile(file) {
  const reader = new FileReader();
  const p = new Promise((resolve, reject) => {
    reader.onload = (e) => {
      document.querySelector('img').setAttribute('src', e.target.result);
      resolve(e.target.result.replace(/^data:image\/(png|jpeg);base64,/, ''));
    };
  })
  reader.readAsDataURL(file);
  return p;
};

function performOcr(base64string) {
  const body = {
    requests: [
      { image: { content: base64string }, features: [{ type: 'TEXT_DETECTION' }] }
    ]
  };
  const settings = JSON.parse(document.querySelector('#settings').value);
  google_cloud_vision_api_key = settings.google_cloud_vision_api_key;
  openai_api_key = settings.openai_api_key;
  google_sheet_api_url = settings.google_sheet_api_url;
  Cookies.set('settings', settings, { expires: cookie_expires, path: '' });

  return fetch(`${ocr_url}?key=${ocr_api_key}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    }
  }).then(res => res.json()).then(res => {
    return res.responses[0].textAnnotations[0].description;
  });
}

function JSONification(text) {
  const schema = `{
    "会社名": "string",
    "部署名": "string",
    "氏名": "string",
    "会社住所": "string | null",
    "電話番号": "string | null",
    "e-mailアドレス": "string | null"
  }`;
  const system_prompt = `次の文字列から会社名、部署名、氏名、会社住所、電話番号、e-mailアドレスを抜き出して、JSON形式で出力してください。JSONのスキーマは次の通りです${schema}`;
  const body = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system_prompt },
      { role: 'user', content: text }
    ]
  }

  return fetch(openai_url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openai_api_key}`,
    }
  }).then(res => res.json()).then(res => {
    const json = res.choices[0].message.content;
    document.querySelector('pre').innerHTML = json;
    return json;
  });
};

function addData(json) {
  let data = JSON.parse(json);
  const lat = document.querySelector('#lat').value;
  const lng = document.querySelector('#lng').value;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
  data.mapUrl = mapUrl;
  return fetch(sheet_api_url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};


