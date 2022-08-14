import requests, time, csv
from bs4 import BeautifulSoup
result	:list[list[str]]	= []
dummy	:str	= 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'
def getHTML(url):
	response			= requests.get(url=url,headers={"User-Agent":dummy})
	response.encoding	= response.apparent_encoding
	return BeautifulSoup(response.text,"html.parser")
for page in range(124,125):
	soup			= getHTML(f"https://www.s-cute.com/contents/?&page={page}")
	for s in soup.find_all("div",class_="post-excerpt relative"):
		last_date	= s.find("div",class_="meta").find("span").text
		url			= s.find("a").get("href")
		author	:list[str]	= getHTML(url).find("h5").text.split(" ")
		line	:list[str]	= [
			author[0][1:],
			author[1],
			s.find("div",class_="small-title cat").text,
			s.find("h4").text,
			url,
			last_date,
		]
		print(line)
		result.append(line)
		time.sleep(1.0)
	with open("./s-cute.csv","a",newline="",encoding="utf-8") as fp:
		csv.writer(fp).writerows(result)
	# if last_date < "2022/04/29":
	# 	break
