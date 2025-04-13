import requests
res = requests.post("https://bbs.zhiyuhub.top/api/client/create_post",json={"token":"0f3ee1dd078b461ea664861b3990746c","title":"测试","content":"测试"})
print(res.json())