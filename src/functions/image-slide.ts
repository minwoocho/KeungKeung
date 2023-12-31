const handleImageSlide = (reviewId: string, nextOrPrev: number) => {
  const currentImageSlider = document.getElementById("img-" + reviewId);
  if (!currentImageSlider) return;

  let current = 0;
  const imageLength = currentImageSlider.getElementsByClassName("gigi-slide").length;
  console.log(imageLength);
  for (let i = 0; i < imageLength; i++) {
    const currentSlide = currentImageSlider.getElementsByClassName("gigi-slide")[
      i
    ] as HTMLDivElement;
    if (currentSlide.style.display == "flex") {
      current = i;
      currentSlide.style.marginLeft = "100%";
      currentSlide.style.display = "none";
      currentSlide.style.marginLeft = "0%";
      break;
    }
  }
  let next = current + nextOrPrev;
  if (next >= imageLength) next = 0;
  else if (next < 0) next = imageLength - 1;

  const nextSlide = currentImageSlider.getElementsByClassName("gigi-slide")[next] as HTMLDivElement;
  nextSlide.style.display = "flex";
};
