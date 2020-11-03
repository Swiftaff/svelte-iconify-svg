<script>
  import icons from "../outputs/test9/icons.js";
</script>

<!--should work -->
{@html icons['bx:bxs-checkbox-checked']}
{@html icons['bx:bx-checkbox-checked']}

<!--should error -->
{@html icons['bxs:checkbox-checked']}
{@html icons['bxs:checkbox']}
{@html icons['bxs2:checkbox-checked']}
{@html icons['bxs2:checkbox']}
{@html icons['bx:checkbox-checked']}
