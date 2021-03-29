FROM python:3.7
FROM node:13.12.0-alpine

RUN  mkdir -p /Users/text_analysis/api
WORKDIR /Users/text_analysis/api


COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent
COPY . /Users/text_analysis/api
RUN pip3 install --no-cache-dir -r requirements.txt

EXPOSE 8080

CMD ["yarn", "start"]
CMD ["yarn", "start-api"]
