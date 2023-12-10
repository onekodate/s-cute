import csv
import datetime
import argparse

parser: argparse.ArgumentParser = argparse.ArgumentParser()
parser.add_argument("filename")
parser.add_argument("column", type=str, choices=["num", "date"])
args: argparse.Namespace = parser.parse_args()

with open(args.filename, "r", encoding="utf-8_sig") as fp:
    result: list[list[str]] = [row for row in csv.reader(fp)]

def sort(x: list[str]) -> int:
    if args.column == "num":
        return int(x[0])
    elif args.column == "date":
        return datetime.datetime.strptime(x[5], "%Y/%m/%d")

result.sort(key=sort, reverse=True)

with open(args.filename, "w", encoding="utf-8_sig", newline="") as fp:
    csv.writer(fp, lineterminator="\n").writerows(result)
