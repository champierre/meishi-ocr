const ocr_url = 'https://vision.googleapis.com/v1/images:annotate';
const openai_url = 'https://api.openai.com/v1/chat/completions';
const cookie_expires = 180;

document.addEventListener('DOMContentLoaded', function() {
  setupAPIKeys();
  setCurrentPosition();
  document.querySelector('#image').addEventListener('change', handleFileSelect);
});

function setupAPIKeys() {
  document.querySelector('#ocr_api_key').value = Cookies.get('ocr_api_key') || '';
  document.querySelector('#openai_api_key').value = Cookies.get('openai_api_key') || '';
  document.querySelector('#sheet_api_url').value = Cookies.get('sheet_api_url') || '';
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
  const ocr_api_key = document.querySelector('#ocr_api_key').value;
  Cookies.set('ocr_api_key', ocr_api_key, { expires: cookie_expires, path: '' });

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
  const openai_api_key = document.querySelector('#openai_api_key').value;
  Cookies.set('openai_api_key', openai_api_key, { expires: cookie_expires, path: '' });
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
  const sheet_api_url = document.querySelector('#sheet_api_url').value;
  Cookies.set('sheet_api_url', sheet_api_url, { expires: cookie_expires, path: '' });
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


