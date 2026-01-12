#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import re
import sys
from bs4 import BeautifulSoup
import time


def get_v2ex_post_content(url):
    """
    获取V2EX帖子的实际内容
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        response.encoding = "utf-8"

        soup = BeautifulSoup(response.text, "html.parser")

        # 获取帖子标题
        title_element = soup.find("h1", class_="topic__title")
        if not title_element:
            title_element = soup.find("title")
        title = title_element.get_text().strip() if title_element else "未知标题"

        # 获取帖子内容
        content_element = soup.find("div", class_="topic_content")
        if not content_element:
            content_element = soup.find("div", class_="markdown_body")

        content = ""
        if content_element:
            # 清理HTML标签，保留纯文本
            content = content_element.get_text().strip()
            # 移除多余的空白行
            content = re.sub(r"\n\s*\n", "\n\n", content)

        # 获取回复
        replies = []
        reply_elements = soup.find_all("div", class_="reply_content")
        for i, reply_element in enumerate(reply_elements):
            # 获取回复的作者信息
            reply_container = reply_element.find_parent("div", class_="cell")
            username = "未知用户"
            if reply_container:
                username_element = reply_container.find(
                    "a", href=re.compile(r"^/member/")
                )
                if username_element:
                    username = username_element.get_text().strip()

            reply_text = reply_element.get_text().strip()
            reply_text = re.sub(r"\n\s*\n", "\n\n", reply_text)
            replies.append(f"回复 {i + 1} ({username}):\n{reply_text}")

        return {"title": title, "content": content, "replies": replies, "url": url}

    except requests.RequestException as e:
        print(f"网络请求错误: {e}")
        return None
    except Exception as e:
        print(f"解析错误: {e}")
        return None


def save_to_text_file(post_data, filename=None):
    """
    将帖子内容保存为文本文件
    """
    if not post_data:
        print("没有数据可保存")
        return

    if not filename:
        # 从标题生成文件名
        safe_title = re.sub(r"[^\w\s-]", "", post_data["title"])
        safe_title = re.sub(r"[-\s]+", "-", safe_title)
        filename = f"v2ex_{safe_title[:50]}.txt"

    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(f"标题: {post_data['title']}\n")
            f.write(f"链接: {post_data['url']}\n")
            f.write(f"获取时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 50 + "\n\n")

            if post_data["content"]:
                f.write("正文内容:\n")
                f.write(post_data["content"])
                f.write("\n\n")
            else:
                f.write("正文内容: 无法获取\n\n")

            if post_data["replies"]:
                f.write("=" * 50 + "\n")
                f.write("回复内容:\n\n")
                f.write("\n\n".join(post_data["replies"]))
            else:
                f.write("=" * 50 + "\n")
                f.write("回复内容: 暂无回复\n")

        print(f"内容已保存到: {filename}")

    except Exception as e:
        print(f"保存文件时出错: {e}")


def main():
    if len(sys.argv) != 2:
        print("用法: python v2ex_scraper.py <V2EX帖子URL>")
        print("示例: python v2ex_scraper.py https://www.v2ex.com/t/1184608")
        sys.exit(1)

    url = sys.argv[1]

    # 验证URL格式
    if not re.match(r"https?://www\.v2ex\.com/t/\d+", url):
        print("错误: 请提供有效的V2EX帖子URL")
        print("格式示例: https://www.v2ex.com/t/1184608")
        sys.exit(1)

    print(f"正在获取帖子内容: {url}")
    post_data = get_v2ex_post_content(url)

    if post_data:
        save_to_text_file(post_data)
        print(f"标题: {post_data['title']}")
        print(f"正文长度: {len(post_data['content'])} 字符")
        print(f"回复数量: {len(post_data['replies'])} 条")
    else:
        print("获取帖子内容失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
