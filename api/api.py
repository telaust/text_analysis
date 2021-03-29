from textblob import TextBlob
from flask import Flask, request, jsonify
from nltk import FreqDist
import nltk
from nltk import FreqDist
import time
from transformers import MarianTokenizer, MarianMTModel
import string
import en_core_web_sm
nlp = en_core_web_sm.load()
import spacy 
from spacy import displacy
from nltk.corpus import wordnet
import string
from nltk.sentiment import SentimentIntensityAnalyzer
sia = SentimentIntensityAnalyzer()
# import matplotlib.pyplot as plt
# import seaborn as sns

app = Flask(__name__)

from transformers import pipeline
classifier = pipeline('sentiment-analysis')

src = 'en'  # source language
trg = 'ru'  # target language
mname = f'Helsinki-NLP/opus-mt-{src}-{trg}'

model = MarianMTModel.from_pretrained(mname)
tok = MarianTokenizer.from_pretrained(mname)

@app.route("/analyse/sentiment/<inputSentence>")
def sentiment_analysis(inputSentence, methods=["POST", "GET"]):
	inputSentence = inputSentence.replace("%20", " ")
	polarity_scores = sia.polarity_scores(inputSentence)
	del polarity_scores["compound"]
	label = max(polarity_scores, key=polarity_scores.get)
	score = max(polarity_scores.values())
	return jsonify(label=label, score=score)


@app.route("/analyse/pos_tagging/<inputSentence>")
def pos_tagging(inputSentence, methods=["POST", "GET"]):
	inputSentence = inputSentence.replace("%20", " ")

	doc = nlp(inputSentence)
	html_code = displacy.render(doc, style="dep")

	return jsonify(html_code=html_code)


@app.route("/analyse/ner/<inputSentence>")
def ner(inputSentence, methods=["POST", "GET"]):
	inputSentence = inputSentence.replace("%20", " ")

	doc = nlp(inputSentence)
	html_code = displacy.render(doc, style="ent")

	return jsonify(html_code=html_code)

@app.route("/analyse/freq/<inputSentence>")
def word_freq(inputSentence, methods=["POST", "GET"]):
	inputSentence = inputSentence.replace("%20", " ")
	
	fdist = FreqDist(preprocess_text(inputSentence))
	a = fdist.most_common(7)
	most_common_words, freqs = [], []
	for i in a:
		freqs.append(i[1])
		most_common_words.append(i[0])

	return jsonify(most_common_words=most_common_words, freqs=freqs)


@app.route("/analyse/translate/<inputSentence>")
def translate_sentence(inputSentence, methods=["POST", "GET"]):
	# sentence = request.get_json()['inputSentence']
	inputSentence = inputSentence.replace("%20", " ")
	
	
	batch = tok.prepare_seq2seq_batch([inputSentence])
	gen = model.generate(**batch) 
	words = tok.batch_decode(gen, skip_special_tokens=True)  

	translated = words[0]

	return jsonify(
		inputSentence=inputSentence,
		outputSentence=translated)


@app.route("/analyse/lexdiv/<inputSentence>")
def lexical_diversity(inputSentence, methods=["POST", "GET"]):
	# unix decode
	inputSentence = inputSentence.replace("%20", " ")

	words = inputSentence.split()
	# remove punctuation from each word
	table = str.maketrans('', '', string.punctuation)
	stripped = [w.translate(table) for w in words]

	coef = len(set(stripped)) / len(stripped)

	return jsonify(lexdiv_coef=coef)


@app.route("/analyse/syn_and_ant/<inputSentence>")
def find_synonyms_and_antonyms(inputSentence, methods=["POST", "GET"]):
	inputSentence = inputSentence.replace("%20", " ")
	list_of_words = preprocess_text(inputSentence)
	# split sentence into list of words & remove punctuation
	# list_of_words = inputSentence.translate(str.maketrans('', '', string.punctuation)).lower().split()
	n_synonyms = []
	n_antonyms = []
	for word in list_of_words:
		synonyms = []
		antonyms = []
		for syn in wordnet.synsets(word):
			for l in syn.lemmas():
				if l.name() != word:
					synonyms.append(l.name())
				if l.antonyms():
					antonyms.append(l.antonyms()[0].name())
		
		n_synonyms.append(len(set(synonyms)))
		n_antonyms.append(len(set(antonyms)))

		# print(len(set(synonyms)))
		# print(len(set(antonyms)))
	return jsonify(list_of_words = list_of_words, n_synonyms=n_synonyms, n_antonyms=n_antonyms)

def preprocess_text(text):
    stopwords = set(nltk.corpus.stopwords.words('english'))
    words = nltk.word_tokenize(text)
    words = [w for w in words if len(w) > 1]
    words = [w for w in words if not w.isnumeric()]
    words = [w.lower() for w in words]
    words = [w for w in words if w not in stopwords]
    
    return words