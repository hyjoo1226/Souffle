import requests
url = "https://i.ibb.co/PGs2Gg1s/step1.png"
r = requests.get(url)
print("크기:", len(r.content), "바이트")
with open("downloaded.png", "wb") as f:
    f.write(r.content)
