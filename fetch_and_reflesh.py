import csv
import time
import datetime
import requests
from bs4 import BeautifulSoup
import webbrowser


class Fetch_and_Write:
    filename: str
    data: list[list[str]]
    urls: list[str]

    def __init__(self, filename: str) -> None:
        self.filename = filename
        with open(f"{self.filename}.csv", "r", encoding="utf_8_sig") as fp:
            self.data = [row for row in csv.reader((fp))]
        self.urls = [row[4] for row in self.data]

    def cookie(self) -> str:
        return (
            "mt_commenter=dHqyV5IwzRWM7XikXj4FRm8PHA1iz04nwNFDv0Zk; commenter_name=onekodate" if self.filename == "s-cute" else
            "coc=1; uuid=f9697c88d23c66117b7a01a47be86164; PHPSESSID=9vcbhjvdt3b06kejmusok57f97; adc=1"
        )

    def wait_and_fetch(self, url: str) -> BeautifulSoup:
        time.sleep(5)
        return BeautifulSoup(
            requests.get(
                url,
                headers={
                    "Host": f"www.{self.filename}.com",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                    "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Connection": "keep-alive",
                    "Cookie": self.cookie(),
                    "Upgrade-Insecure-Requests": "1",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "none" if self.filename == "s-cute" else "cross-site",
                    "Sec-Fetch-User": "?1",
                },
            ).content,
            "html.parser",
        )

    def date2date(self, old_date: str) -> str:
        return datetime.datetime.strptime(old_date, "%Y/%m/%d").strftime("%Y/%m/%d")

    def fetch_s_cute(self) -> None:
        break_count: int = 0
        for i in range(10):
            html: BeautifulSoup = self.wait_and_fetch(f"https://www.s-cute.com/contents/?&page={i+1}")
            for div in html.find_all("article", class_="contents"):
                url: str = div.find("a").get("href")
                title: str = div.find("h4", class_="contents-title").text
                date: str = self.date2date(div.find("div", class_="meta").find("span").text)
                genre: str = div.find("div", class_="small-title cat").text
                girl: str = title[title.index("／") + 1:]
                img_url: str = div.find("img").get("src")
                idx: int = img_url.index("images/") + len("images/")
                num: str = img_url[idx:idx + 3]
                # 0   1   2      3     4   5    6
                # 925 Mei S-cute Title URL Date 場所
                row: list[str] = [num, girl, genre, title, url, date, ""]
                if url in self.urls:
                    print(f'SKIP   {" ".join(row)}')
                    break_count += 1
                else:
                    self.data.append(row)
                    print(f'APPEND {" ".join(row)}')
                if break_count > 5:
                    break
            if break_count > 5:
                break

    def fetch_mgstage(self) -> None:
        for target in ["300MIUM", "348NTR", "390JAC", "390JNT", "451HHH", "483SGK"]:
            break_count: int = 0
            for i in range(1000):
                num: str = str(i)
                url: str = f"https://www.mgstage.com/product/product_detail/{target}-{num.zfill(3)}/"
                if url in self.urls:
                    continue
                div: BeautifulSoup = self.wait_and_fetch(url)
                if div.find("h1", class_="tag") is None:
                    print(f"NOT FOUND {url}")
                    break_count += 1
                    if break_count > 5:
                        break
                    else:
                        continue
                else:
                    break_count = 0
                title: str = div.find("h1", class_="tag").text.strip()
                table: list[BeautifulSoup] = div.find(
                    "div", class_="detail_data"
                ).find_all_next(
                    "table",
                )[1].find_all(
                    "td"
                )

                girl: str = table[0].text.strip()
                date: str = table[4].text
                genre: str = table[6].text.strip()
                #                 0   1   2      3     4   5    6
                #                 925 Mei S-cute Title URL Date 場所
                row: list[str] = [num, girl, genre, title, url, date, ""]
                self.data.append(row)
                print(f'APPEND {",".join(row)}')
                break_count = 0

    def save(self) -> None:
        for x in self.data:
            x[5] = self.date2date(x[5])
        self.data.sort(
            key=lambda x: datetime.datetime.strptime(x[5], "%Y/%m/%d"),
            reverse=True,
        )
        with open(f"{self.filename}.csv", "w", encoding="utf-8_sig", newline="") as fp:
            csv.writer(fp, lineterminator="\n").writerows(self.data)

    def open_in_browser(self) -> None:
        webbrowser.register(
            "firefox",
            None,
            webbrowser.BackgroundBrowser("C:\\Program Files\\Mozilla Firefox\\firefox.exe"),
        )

        break_count: int = 0
        for row in self.data:
            if row[6] == "":
                time.sleep(5)
                webbrowser.get("firefox").open_new_tab(row[4])
            else:
                break_count += 1
            if break_count > 30:
                break

    def execute(self) -> None:
        if self.filename == "s-cute":
            self.fetch_s_cute()
        elif self.filename == "mgstage":
            self.fetch_mgstage()
        self.save()
        self.open_in_browser()


if __name__ == "__main__":
    for filename in ["s-cute", "mgstage"]:
        Fetch_and_Write(filename).execute()
