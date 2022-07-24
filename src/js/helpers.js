import { async } from 'regenerator-runtime';
import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
/*
//contains the repititive functions we always use
export const getJSON = async function (url) {
  try {
    //as soon as any of these promises reject or fullfills first, that promise will be the winner! so if it gets too long to fetch, then it will timeout.
    const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${data.message} (${res.status})`);
    }

    return data;
  } catch (err) {
    //***RETHROWING THE ERROR: reject the promise from getJASON so we handle the error in model.js
    throw err;
  }
};
//How to send data to API using fetch:
export const sendJSON = async function (url, uploadData) {
  try {
    //as soon as any of these promises reject or fullfills first, that promise will be the winner! so if it gets too long to fetch, then it will timeout.
    const fetchPromise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });
    const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${data.message} (${res.status})`);
    }

    return data;
  } catch (err) {
    //***RETHROWING THE ERROR: reject the promise from getJASON so we handle the error in model.js
    throw err;
  }
};
*/
export const AJAX = async function (url, uploadData = undefined) {
  try {
    //if uploadData is available, fetch should be this: otherwise should be fetch(url)
    //prettier-ignore
    const fetchPromise = uploadData ? fetch(url, {method: 'POST',headers: {'Content-Type': 'application/json',},body: JSON.stringify(uploadData),}): fetch(url);

    const res = await Promise.race([fetchPromise, timeout(TIMEOUT_SEC)]);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`${data.message} (${res.status})`);
    }

    return data;
  } catch (err) {
    //***RETHROWING THE ERROR: reject the promise from getJASON so we handle the error in model.js
    throw err;
  }
};
