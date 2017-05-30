<?php
/**
 * The template for displaying WooCommerce product Quick View.
 *
 * @package polestar
 * @license GPL 2.0 
 */

while ( have_posts() ) : the_post();

	global $post, $product;

	if ( ! function_exists( 'polestar_woocommerce_quick_view_class' ) ) :
	/**
	 * Adds the product-quick-view class to the Quick View post.
	 */
	function polestar_woocommerce_quick_view_class( $classes ) {
		$classes[] = "product-quick-view";
		return $classes;
	}
	endif;
	add_filter('post_class', 'polestar_woocommerce_quick_view_class');

	?>
	<div id="product-<?php the_ID(); ?>" <?php post_class(); ?>>

		<div class="product-content-wrapper">
	
			<div class="product-image-wrapper">

				<?php do_action( 'polestar_woocommerce_quick_view_images' ); ?>

			</div>

			<div class="product-info-wrapper">

				<span class="quickview-close-icon"><?php polestar_display_icon( 'close' ); ?></span>

				<a href="<?php the_permalink(); ?>">
					<?php do_action( 'polestar_woocommerce_quick_view_title' ); ?>
				</a>

				<?php do_action( 'polestar_woocommerce_quick_view_content' ); ?>

			</div>

		</div>

	</div>

<?php endwhile;
