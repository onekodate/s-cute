import requests, time, csv, sys
from bs4 import BeautifulSoup
label	:str	= sys.argv[1]
	# 390JAC
	# 390JNT
	# 348NTR
	# 451HHH
	# 483SGK
	# 300MIUM
	# 300MAAN
dummy	:str	= "Edg/104.0.1293.47"
count	:int	= 0
def getHTML(url):
	response			= requests.get(url=url,headers={"User-Agent":dummy},cookies={"adc":"1"})
	response.encoding	= response.apparent_encoding
	return BeautifulSoup(response.text,"html.parser")
def replace(text:str) -> str:
	return text.replace("\n","").replace(" ","").replace("&amp;","&")
for i in range(1,1000):
	url	:str	= f"https://www.mgstage.com/product/product_detail/{label}-{str(i).zfill(3)}"
	soup		= getHTML(url)
	if len(soup.find_all("table")) < 2:
		count	+= 1
		print(f"skip: {url}")
	else:
		count	= 0
		table	= soup.find_all("table")[1].find_all("td")
		line	:list[str]	= [
			"0",
			replace( table[0].text ),
			replace( table[6 if label=="300MIUM" or label=="300MAAN" else 5].text ),
			replace( soup.find("h1",class_="tag").text ),
			url,
			replace( table[4].text ),
		]
		print(line)
		with open(f"./{label}.csv","a",newline="",encoding="utf-8") as fp:
			csv.writer(fp).writerow(line)
		time.sleep(1.0)
	if count > 5:
		break
	# if last_date < "2022/04/29":
	# 	break
