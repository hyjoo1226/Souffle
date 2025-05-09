import torch
from PIL import Image
from transformers import AutoProcessor, VisionEncoderDecoderModel
import requests

# 모델 및 프로세서 초기화 (모듈 로드시 1회만 수행)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = VisionEncoderDecoderModel.from_pretrained('hoang-quoc-trung/sumen-base').to(device)
processor = AutoProcessor.from_pretrained('hoang-quoc-trung/sumen-base')
task_prompt = processor.tokenizer.bos_token
decoder_input_ids = processor.tokenizer(
    task_prompt,
    add_special_tokens=False,
    return_tensors="pt"
).input_ids.to(device)

def predict_latex_from_images(image_paths):
    """
    주어진 이미지 경로 리스트에 대해 LaTeX 수식을 추론합니다.

    Args:
        image_paths (List[str]): 추론할 이미지 경로 리스트

    Returns:
        List[str]: 각 이미지에 대한 LaTeX 예측 결과 리스트
    """
    # stream=True : 이미지를 한줄씩 처리
    # .raw 저수준 바이트 스트림 객체
    images = [Image.open(requests.get(image, stream=True).raw).convert('RGB') for image in image_paths]
    pixel_values = [
        processor.image_processor(
            image,
            return_tensors="pt",
            data_format="channels_first"
        ).pixel_values.to(device)
        for image in images
    ]

    results = []
    with torch.no_grad():
        for pixel_value in pixel_values:
            outputs = model.generate(
                pixel_value,
                decoder_input_ids=decoder_input_ids,
                max_length=model.decoder.config.max_length,
                pad_token_id=processor.tokenizer.pad_token_id,
                eos_token_id=processor.tokenizer.eos_token_id,
                use_cache=True,
                num_beams=4,
                bad_words_ids=[[processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True
            )
            sequence = processor.tokenizer.batch_decode(outputs.sequences)[0]
            cleaned = sequence.replace(
                processor.tokenizer.eos_token, ""
            ).replace(
                processor.tokenizer.pad_token, ""
            ).replace(
                processor.tokenizer.bos_token, ""
            )
            results.append(cleaned)
    return results
