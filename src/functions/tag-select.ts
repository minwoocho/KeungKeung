document.addEventListener("DOMContentLoaded", function () {
  handleTagLayoutScroll("main-tag-layout");
  handleTagLayoutScroll("base-layout");

  const tags = document.getElementsByClassName("main-tag");
  // const cardTags = this.getElementsByClassName('card-tag');

  // for (const tag of tags) {
  //   const result = tag.addEventListener("click", handleOnClickTag);
  // }

  // 태그 투표는 MVP 이후 진행
  // for (const tag of cardTags) {
  //   const result = tag.addEventListener('click', handleOnClickTag);
  // }

  const addReviewButton = document.getElementById("main-top-add");
  addReviewButton?.addEventListener("click", handleOnClickAddReview);
});

/**
 * 공통으로 뺄 예정
 * @param id scrollable element id
 * @returns None
 * @description Let element scrollabe by grabbing and move
 */
const handleTagLayoutScroll = (id: string) => {
  const ele = document.getElementById(id);
  if (!ele) return;

  let pos = { top: 0, left: 0, x: 0, y: 0 };

  const mouseDownHandler = function (e: any) {
    ele.style.userSelect = "none";

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  const mouseMoveHandler = function (e: any) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };

  const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };

  // Attach the handler
  ele.addEventListener("mousedown", mouseDownHandler);
};

/**
 * @param e MouseEvent
 * @returns: None
 * @description : handle when the tag is clicked
 */
const handleOnClickTag = (e: HTMLDivElement) => {
  // const currentTag = e as HTMLDivElement;
  if (e) {
    e.className =
      e.className.length > 8
        ? e.className.slice(0, 8)
        : e.className + " selected";
  }
};

/**
 * @returns None
 * @description : handle when user clicked add-review button
 */
const handleOnClickAddReview = () => {
  console.log("hi");
  location.replace("/add-review");
};
