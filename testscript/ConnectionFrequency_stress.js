import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
    stages: [
        {duration: '1m', target: 150},
        {duration: '2m', target: 150},
        {duration: '1m', target: 200},
        {duration: '2m', target: 200},
        {duration: '1m', target: 250},
        {duration: '2m', target: 250},
        {duration: '1m', target: 300},
        {duration: '2m', target: 300},
        {duration: '10s', target: 0}
    ],

    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

const BASE_URL = 'https://dacapolife87-test.n-e.kr/';
const USERNAME = 'test id';
const PASSWORD = 'test password';

export default function ()  {

    var payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });

    var params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };


    let loginRes = http.post(`${BASE_URL}/login/token`, payload, params);

    check(loginRes, {
        'logged in successfully': (resp) => resp.json('accessToken') !== '',
    });


    let authHeaders = {
        headers: {
            Authorization: `Bearer ${loginRes.json('accessToken')}`,
        },
    };
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, { 'retrieved member': (obj) => obj.id != 0 });
    sleep(1);
};
