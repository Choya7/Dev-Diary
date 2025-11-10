// document.addEventListener('DOMContentLoaded', () => {
//     const allElements = document.querySelectorAll('[data-include-path]');
//     allElements.forEach(el => {
//         const includePath = el.dataset.includePath;
//         fetch(includePath)
//             .then(res => res.ok ? res.text() : '')
//             .then(data => {
//                 if (data) {
//                     el.innerHTML = data;
//                 }
//             });
//     });
// });
// includeHTML.js
// 데이터 속성 data-include-path를 가진 요소에 HTML을 삽입하는 스크립트
// Live Reload와 호환되도록 outerHTML 대신 innerHTML 사용

document.addEventListener('DOMContentLoaded', () => {
    const allElements = document.querySelectorAll('[data-include-path]');

    allElements.forEach(el => {
        const includePath = el.dataset.includePath;

        if (!includePath) return; // 경로가 없으면 건너뜀

        fetch(includePath)
            .then(response => {
                if (response.ok) {
                    return response.text();
                } else {
                    console.error(`Include failed: ${includePath} (${response.status})`);
                    return '';
                }
            })
            .then(data => {
                if (data) {
                    el.innerHTML = data; // outerHTML -> innerHTML 변경
                }
            })
            .catch(err => {
                console.error(`Error fetching include file: ${includePath}`, err);
            });
    });
});
