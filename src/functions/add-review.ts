const dataTransfer = new DataTransfer();

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

/**
 *
 * @param input HTMLInputElement file type
 * @returns
 * @description handle when user uploaded photos in review-add page
 */
const loadFile = (input: HTMLInputElement) => {
  if (!input.files) return;

  if (input.files.length > 9) {
    alert("사진은 최대 9장까지 첨부 가능합니다.");
    return;
  }

  const imageContainer = document.getElementById("image-container");
  const addPictureBtn = document.getElementById("add-picture-button");

  if (input.files) {
    if (input.files.length + dataTransfer.items.length > 9) {
      alert("사진은 최대 9장까지 첨부 가능합니다.");
      return;
    }
    addPictureBtn !== null && imageContainer?.removeChild(addPictureBtn);

    for (const photo of input.files) {
      dataTransfer.items.add(photo);

      // 1. 이미지 만들어주기
      const img = document.createElement("img");
      img.style.height = "100%";
      img.style.width = "100%";
      img.style.objectFit = "contain";
      img.src = URL.createObjectURL(photo);

      // 2. 이미지 컨테이너 만들어주기
      const imgDiv = document.createElement("div");
      imgDiv.setAttribute("class", "new-image");

      // 3. x버튼 만들어주기
      const xButton = document.createElement("button");
      const closeImg = document.createElement("img");
      closeImg.src = "assets/icon/close.svg";

      xButton.appendChild(closeImg);
      xButton.setAttribute("class", "delete-button");
      xButton.setAttribute("onclick", "deletePhoto(this)");
      xButton.type = "button";
      xButton.id = Date.now.toString() + photo.name;

      imgDiv.append(img, xButton);

      imageContainer?.appendChild(imgDiv);
    }

    if (addPictureBtn && dataTransfer.items.length >= 9) {
      addPictureBtn.style.display = "none";
    } else if (addPictureBtn) {
      imageContainer?.appendChild(addPictureBtn);
    }
  }
  const imgForm = document.getElementById("img-upload") as HTMLInputElement;
  imgForm.files = dataTransfer.files;
};

const handleAddPictureButton = () => {
  const originalInput = document.getElementById("img-upload");
  originalInput?.click();
};

const deletePhoto = (input: HTMLButtonElement) => {
  const buttons = document.querySelectorAll(".delete-button");
  buttons.forEach((button, idx) => {
    if (button.id === input.id) {
      dataTransfer.items.remove(idx);
      const newImgList = document.getElementsByClassName("new-image");
      if (newImgList[idx]) {
        document.querySelector("#image-container")?.removeChild(newImgList[idx]);
      }
      const addPhotoButton = document.querySelector("#add-picture-button") as HTMLDivElement;
      if (addPhotoButton === null) {
        const newButton = document.createElement("div");
        newButton.id = "add-picture-button";
        newButton.setAttribute("onclick", "handleAddPictureButton()");

        const addImg = document.createElement("img");
        addImg.src = "assets/icon/add.png";
        addImg.setAttribute("style", "width:2rem;height:2rem;margin-bottom:10px");
        const addText = document.createElement("p");
        addText.innerHTML = "사진 추가하기";

        newButton.append(addImg, addText);

        document.querySelector("#image-container")?.appendChild(newButton);
      }
    }
  });
};
