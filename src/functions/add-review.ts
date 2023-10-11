document.addEventListener("DOMContentLoaded", function () {
  const tags = document.getElementsByClassName("card-tag");

  for (const tag of tags) {
    tag.addEventListener("click", handleAddTag);
  }
});

/**
 *
 * @param e The tag which is selected
 * @description handle when user selected a tag in review-add page
 */
const handleAddTag = (e: Event) => {
  const selectedTag = e.currentTarget as HTMLDivElement;
  selectedTag.style.display = "none";
};

const loadFile = (input: any) => {
  if (input.files.length > 9) {
    alert("사진은 최대 9장까지 첨부 가능합니다.");
    return;
  }

  const imageContainer = document.getElementById("image-container");

  const addPictureBtn = document.getElementById("add-picture-button");
  if (addPictureBtn) addPictureBtn.style.display = "none";
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const img = document.createElement("img");
      img.style.height = "100%";
      img.style.width = "100%";
      img.style.objectFit = "contain";

      img.src = URL.createObjectURL(input.files[i]);
      const newImage = document.createElement("div");
      newImage.setAttribute("class", "new-image");
      newImage.appendChild(img);

      imageContainer?.appendChild(newImage);
    }
  }
};

const handleAddPictureButton = () => {
  const originalInput = document.getElementById("img-upload");
  originalInput?.click();
};
