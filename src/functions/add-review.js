"use strict";
document.addEventListener('DOMContentLoaded', function () {
    const tags = document.getElementsByClassName('card-tag');
    for (const tag of tags) {
        tag.addEventListener('click', handleAddTag);
    }
});
/**
 *
 * @param e The tag which is selected
 * @description handle when user selected a tag in review-add page
 */
const handleAddTag = (e) => {
    const selectedTag = e.currentTarget;
    selectedTag.style.display = 'none';
};
