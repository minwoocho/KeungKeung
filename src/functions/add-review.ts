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
  const file = input.files[0];

  const newImage = document.createElement("img");
  newImage.setAttribute("class", "new-image");
  newImage.src = URL.createObjectURL(file);

  const imageContainer = document.getElementById("image-container");
  imageContainer?.appendChild(newImage);
};
