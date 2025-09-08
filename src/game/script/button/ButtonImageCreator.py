import re
import os, shutil
import subprocess
from PIL import Image

def create_button_image(ratio, image_name, src_folder_path, output_folder_path, type_name):

    src_type_folder_path = os.path.join(src_folder_path, type_name)
    
    left_image = Image.open(os.path.join(src_type_folder_path, f"left_{type_name}.png"))
    mid_image = Image.open(os.path.join(src_type_folder_path, f"mid_{type_name}.png"))
    right_image = Image.open(os.path.join(src_type_folder_path, f"right_{type_name}.png"))

    left_width, left_height = left_image.size
    mid_width, mid_height = mid_image.size
    right_width, right_height = right_image.size
    
    mid_expected_width = int((left_height * ratio - left_width - right_width) // mid_width) * mid_width
    sprite_width = left_width + mid_expected_width + right_width
    sprite_sheet = Image.new("RGBA", (sprite_width, left_height))
    
    
    sprite_sheet.paste(left_image, (0, 0))
    
    for i in range(0, mid_expected_width, mid_width):
        sprite_sheet.paste(mid_image, (left_width + i, 0))
        
    sprite_sheet.paste(right_image, (left_width + mid_expected_width, 0))
    
    if type_name == "normal":
        sprite_sheet.save(os.path.join(output_folder_path, f"{image_name}.png"))
    else :
        sprite_sheet.save(os.path.join(output_folder_path, f"{image_name}_{type_name}.png"))

def create_button_images(aspect_ratio, image_name, src_folder_path, output_root_folder_path):
    type_names = ["normal", "hv", "click", "idle"]
    fractions = aspect_ratio.replace(" ", "").split("/")
    ratio = float(fractions[0]) / float(fractions[1])
    
    output_folder_path = os.path.join(output_root_folder_path, image_name + "Button")
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)
        
    for type_name in type_names:
        create_button_image(ratio, pascal_to_snake(image_name), src_folder_path, output_folder_path, type_name)

def pascal_to_snake(name):
    # Convert PascalCase to snake_case
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def generate_button_component(button_name, aspect_ratio, output_folder_path):
    
    component_code = f'''import React from "react";
import ImageButton from "../../script/common/ImageButton";
import image from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}.png";
import hoverImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_hv.png";
import clickImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_click.png";
import disabledImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_idle.png";

interface Props {{
  isDisabled: boolean;
  onClick: () => void;
}}

const {button_name}Button = ({{ isDisabled, onClick }}: Props) => {{
  return (
    <div
      style={{{{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "auto",
        height: "100%",
        aspectRatio: "{aspect_ratio}",
        transform: "translate(-50%, -50%)",
        margin: "0px",
      }}}}
    >
      <ImageButton
        onClick={{onClick}}
        isDisabled={{isDisabled}}
        defaultImagePath={{image}}
        hoverImagePath={{hoverImage}}
        clickedImagePath={{clickImage}}
        disabledImagePath={{disabledImage}}
      />
    </div>
  );
}};

export default {button_name}Button;
'''

    # Create output directory if it doesn't exist
    os.makedirs(output_folder_path, exist_ok=True)
    
    # Write the component file
    output_file = os.path.join(output_folder_path, f"{button_name}Button.tsx")
    with open(output_file, 'w') as f:
        f.write(component_code)
    
    print(f"Generated: {output_file}")
    return output_file

def generate_text_button_component(button_name, aspect_ratio, output_folder_path, fontFamily, color, fontSizeRatio, text):

    component_code = f'''import React from "react";
import ImageTextButton from "../../script/common/ImageTextButton";
import {{ getTextShadowStyle }} from "../common/Utility";
import image from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}.png";
import hoverImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_hv.png";
import clickImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_click.png";
import disabledImage from "../../image/Buttons/{button_name}Button/{pascal_to_snake(button_name)}_idle.png";

interface Props {{
  isDisabled: boolean;
  onClick: () => void;
}}

const {button_name}Button = ({{ isDisabled, onClick }}: Props) => {{
  const fontFamily = "{fontFamily}";
  const isBold = true;
  const color = "{color}";
  const fontSizeRatio = {fontSizeRatio};
  const text = "{text}";

  const getText = (fontBaseSize: number) => {{
    const fontSize = fontBaseSize * fontSizeRatio;
    return (
      <p
        className="adjustable-image-text-button-text"
        style={{{{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "90%",
          height: "auto",
          transform: "translate(-50%, -50%)",
          margin: "0px",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
          color: color,
          fontFamily: fontFamily,
          fontSize: `${{fontSize}}px`,
          whiteSpace: "pre",
          ...(isBold ? {{ fontWeight: "bold" }} : {{}}),
          ...getTextShadowStyle(fontSize / 15),
        }}}}
      >
        {{text}}
      </p>
    );
  }};

  return (
    <div
      style={{{{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "auto",
        height: "100%",
        aspectRatio: "{aspect_ratio}",
        transform: "translate(-50%, -50%)",
        margin: "0px",
      }}}}
    >
      <ImageTextButton
        onClick={{onClick}}
        isDisabled={{isDisabled}}
        normalImage={{image}}
        hoverImage={{hoverImage}}
        clickImage={{clickImage}}
        disabledImage={{disabledImage}}
        getText={{getText}}
      />
    </div>
  );
}};

export default {button_name}Button;
'''

    # Create output directory if it doesn't exist
    os.makedirs(output_folder_path, exist_ok=True)
    
    # Write the component file
    output_file = os.path.join(output_folder_path, f"{button_name}Button.tsx")
    with open(output_file, 'w') as f:
        f.write(component_code)
    
    print(f"Generated: {output_file}")
    return output_file

aspect_ratio = "132 / 45"
button_name = "MarketRefresh"
fontFamily = "mishmash"
color = "white"
fontSize = 0.7
text = "Refresh"
template_path = "./orange_button/"
output_root_folder_path = "../../image/Buttons/"
script_output_folder_path = "./"

create_button_images(
    aspect_ratio,
    button_name,
    template_path,
    output_root_folder_path
)

# generate_button_component(
#     button_name,
#     aspect_ratio,
#     script_output_folder_path,
# )

generate_text_button_component(
    button_name,
    aspect_ratio,
    script_output_folder_path,
    fontFamily,
    color,
    fontSize,
    text
)
