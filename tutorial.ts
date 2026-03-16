function hello(name: string) {
    return `Hello, ${name}!`;
}

console.log(hello("World"));

// 정규표현식을 사용하여 이메일 형식이 유효한지 체크하는 함수
function is_valid_email(email: string) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return pattern.test(email);
}

console.log(is_valid_email("test@example.com"));
console.log(is_valid_email("test@example.com.kr"));
console.log(is_valid_email("test@example.com.kr.kr"));
console.log(is_valid_email("test@example.com.kr.kr.kr"));
console.log(is_valid_email("test@example.com.kr.kr.kr.kr"));
console.log(is_valid_email("test@example.com.kr.kr.kr.kr.kr"));
