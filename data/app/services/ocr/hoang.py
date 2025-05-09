import torch
# import requests
from PIL import Image
from transformers import AutoProcessor, VisionEncoderDecoderModel
import time
import os

start = time.time()
# Load model & processor
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = VisionEncoderDecoderModel.from_pretrained('hoang-quoc-trung/sumen-base').to(device)
processor = AutoProcessor.from_pretrained('hoang-quoc-trung/sumen-base')        # 전처리기
print(type(processor), type(processor.tokenizer), type(processor.tokenizer.vocab))
task_prompt = processor.tokenizer.bos_token
# vector화된 image
decoder_input_ids = processor.tokenizer(
    task_prompt,
    add_special_tokens=False,
    return_tensors="pt"
).input_ids

inference = time.time()
## Load image
# 디렉토리에 있는 이미지 리스트 생성
image_dir = "images/"  # 이미지들이 있는 디렉토리
image_paths = [
    os.path.join(image_dir, fname)
    for fname in os.listdir(image_dir)
    if fname.lower().endswith((".png", ".jpg", ".jpeg"))
]
print(image_paths)

# img_url = '1.png'
# 이미지 읽은 파일 리스트 생성성
images = [Image.open(image).convert('RGB') for image in image_paths]
pixel_values = [processor.image_processor(
    image,
    return_tensors="pt",
    data_format="channels_first",
).pixel_values for image in images]

# Generate LaTeX expression
results = []
with torch.no_grad():       # gradient 계산 호출 막는 메서드
    for pixel_value in pixel_values:
        outputs = model.generate(           #
            pixel_value.to(device),
            decoder_input_ids=decoder_input_ids.to(device),
            max_length=model.decoder.config.max_length,
            pad_token_id=processor.tokenizer.pad_token_id,
            eos_token_id=processor.tokenizer.eos_token_id,
            use_cache=True,
            num_beams=4,
            bad_words_ids=[[processor.tokenizer.unk_token_id]],
            return_dict_in_generate=True,
        )
        sequence = processor.tokenizer.batch_decode(outputs.sequences)[0]
        sequence = sequence.replace(
                processor.tokenizer.eos_token, ""
            ).replace(
                processor.tokenizer.pad_token, ""
            ).replace(processor.tokenizer.bos_token,"")
        # results.append(sequence)
        print(sequence)
# print(results)

end = time.time()
print(end-start, end - inference)