<script>
  export let url,
    title,
    description,
    id,
    tags = [],
    createdAt,
    modifiedAt

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", options)
    return formattedDate
  }

  console.log(tags)
</script>

<div class="full-image-card">
  <a href="/dashboard/myimages/{id}" class="anchor">
    <img src={url} alt={title} />
    <div class="details">
      <p class="title">{title}</p>
      {#if description}
        <p class="description">{description}</p>
      {/if}
      {#if tags}
        <div class="tags">
          <span>Tags:&nbsp;</span>
          {#each tags as tag}
            <span class="tag">{tag},&nbsp;</span>
          {/each}
        </div>
      {/if}
      <p class="created-at">Created on: {formatDate(createdAt)}</p>
      {#if modifiedAt}
        <p class="modified-at">Last modified at: {formatDate(modifiedAt)}</p>
      {/if}
    </div>
  </a>
</div>

<style>
  .full-image-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 1);
  }

  img {
    width: 100%;
    border-radius: 8px 8px 0 0;
  }

  .details {
    padding: 1rem;
    background-color: #172740;
    color: #fff;
    border-radius: 0 0 8px 8px;
  }

  .title {
    margin: 0;
    font-size: 1.2rem;
  }

  .description {
    margin-top: 0.4rem;
    font-size: 0.9rem;
  }

  .created-at,
  .modified-at {
    margin-top: 0.4rem;
    font-size: 0.8rem;
  }
  .anchor {
    text-decoration: none;
    color: #fff;
  }

  .tags {
    display: flex;
    align-items: center;
  }
</style>
